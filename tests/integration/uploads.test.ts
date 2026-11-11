import sharp from 'sharp'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { db, resetDatabase } from './helpers'

const { send, getSignedUrl, assertAdmin, revalidatePath } = vi.hoisted(() => ({
  send: vi.fn(),
  getSignedUrl: vi.fn(),
  assertAdmin: vi.fn(),
  revalidatePath: vi.fn(),
}))
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = send
  },
  GetObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
  PutObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
}))
vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('@/lib/auth/session', () => {
  class UnauthorizedError extends Error {
    readonly status = 401
  }
  return { assertAdmin, UnauthorizedError }
})

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { registerPhoto, requestUpload } from '@/actions/uploads'
import { UnauthorizedError } from '@/lib/auth/session'
import { MAX_UPLOAD_BYTES } from '@/lib/uploads/validate'

const jpeg = (width: number, height: number, exif?: Record<string, string>) => {
  let image = sharp({ create: { width, height, channels: 3, background: '#5577aa' } })
  if (exif) image = image.withExif({ IFD0: exif })
  return image.jpeg().toBuffer()
}

/** What S3 returns for GetObject. */
const object = (bytes: Buffer | null, overrides: Record<string, unknown> = {}) => ({
  Body: bytes ? { transformToByteArray: async () => new Uint8Array(bytes) } : undefined,
  ContentLength: bytes?.length ?? 0,
  ContentType: 'image/jpeg',
  ...overrides,
})

const puts = () => send.mock.calls.map(([c]) => c).filter((c) => c instanceof PutObjectCommand)

beforeEach(async () => {
  assertAdmin.mockReset().mockResolvedValue({ user: { email: 'admin@example.com' } })
  revalidatePath.mockReset()
  send.mockReset()
  getSignedUrl.mockReset().mockResolvedValue('https://bucket.s3.example/presigned?sig=1')
  await resetDatabase()
})

afterAll(() => db.$disconnect())

describe('requestUpload', () => {
  const valid = { purpose: 'photo', filename: 'Sunset (1).JPG', contentType: 'image/jpeg', size: 2048 }

  it('returns a presigned PUT URL for a server-generated key', async () => {
    const result = await requestUpload(valid)
    expect(result).toMatchObject({ ok: true, data: { url: 'https://bucket.s3.example/presigned?sig=1', contentType: 'image/jpeg' } })
    const key = (result as { data: { key: string } }).data.key
    expect(key).toMatch(/^portfolio\/\d+-[a-z0-9]+-sunset-1\.jpg$/)

    const [, command, options] = getSignedUrl.mock.calls[0] as [unknown, { input: Record<string, unknown> }, { expiresIn: number }]
    expect(command.input).toMatchObject({ Bucket: 'test-bucket', Key: key, ContentType: 'image/jpeg' })
    expect(options.expiresIn).toBe(300)
  })

  it('uses the projects prefix for project images', async () => {
    const result = await requestUpload({ ...valid, purpose: 'project' })
    expect((result as { data: { key: string } }).data.key).toMatch(/^projects\//)
  })

  it.each([
    [{ ...valid, contentType: 'image/svg+xml' }],
    [{ ...valid, size: MAX_UPLOAD_BYTES + 1 }],
    [{ ...valid, purpose: 'avatar' }],
    [null],
  ])('refuses %j without signing anything', async (input) => {
    expect(await requestUpload(input)).toEqual({ ok: false, error: 'validation' })
    expect(getSignedUrl).not.toHaveBeenCalled()
  })

  it('refuses without an admin session', async () => {
    assertAdmin.mockRejectedValue(new UnauthorizedError())
    expect(await requestUpload(valid)).toEqual({ ok: false, error: 'unauthorized' })
    expect(getSignedUrl).not.toHaveBeenCalled()
  })

  it('reports a failure when signing fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    getSignedUrl.mockRejectedValue(new Error('no credentials'))
    expect(await requestUpload(valid)).toEqual({ ok: false, error: 'failed' })
    error.mockRestore()
  })
})

describe('registerPhoto', () => {
  it('reads the uploaded object and creates the photo with size, blur and EXIF', async () => {
    send.mockResolvedValue(object(await jpeg(800, 600, { Make: 'TESTCAM', Model: 'X1' })))
    const result = await registerPhoto('portfolio/1-abc-sunset.jpg')
    expect(result.ok).toBe(true)

    const photo = await db.photo.findFirstOrThrow()
    expect(photo).toMatchObject({ key: 'portfolio/1-abc-sunset.jpg', width: 800, height: 600, status: 'PUBLISHED', position: 0, albumId: null })
    expect(photo.blurDataUrl).toMatch(/^data:image\/jpeg;base64,/)
    expect(photo.exif).toMatchObject({ make: 'TESTCAM', model: 'X1' })
    expect(puts()).toHaveLength(0) // small image: the stored object is left untouched
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('downscales an oversized original and writes it back to the same key', async () => {
    send.mockResolvedValue(object(await jpeg(4000, 2000)))
    await registerPhoto('portfolio/1-abc-big.jpg')

    expect(await db.photo.findFirstOrThrow()).toMatchObject({ width: 3200, height: 1600 })
    expect(puts()).toHaveLength(1)
    expect(puts()[0]).toMatchObject({ input: { Bucket: 'test-bucket', Key: 'portfolio/1-abc-big.jpg', ContentType: 'image/jpeg' } })
    const stored = await sharp((puts()[0] as { input: { Body: Buffer } }).input.Body).metadata()
    expect([stored.width, stored.height]).toEqual([3200, 1600])
  })

  it('assigns the next position and the chosen album', async () => {
    const album = await db.album.create({ data: { slug: 'a', title: { en: 'A' } } })
    await db.photo.create({ data: { key: 'portfolio/existing.jpg', position: 4 } })
    send.mockResolvedValue(object(await jpeg(100, 100)))
    await registerPhoto('portfolio/1-x-new.jpg', album.id)
    expect(await db.photo.findUniqueOrThrow({ where: { key: 'portfolio/1-x-new.jpg' } })).toMatchObject({ position: 5, albumId: album.id })
  })

  it('refuses keys outside the photo prefix and bad album values, without touching S3', async () => {
    for (const key of ['projects/a.jpg', 'portfolio/../x.jpg', '/portfolio/a.jpg', 42, null, undefined]) {
      expect(await registerPhoto(key)).toEqual({ ok: false, error: 'validation' })
    }
    expect(await registerPhoto('portfolio/a.jpg', 42)).toEqual({ ok: false, error: 'validation' })
    expect(send).not.toHaveBeenCalled()
    expect(await db.photo.count()).toBe(0)
  })

  it('refuses bytes that are not an image, empty objects and oversized objects', async () => {
    send.mockResolvedValueOnce(object(Buffer.from('not an image')))
    expect(await registerPhoto('portfolio/1-a-text.jpg')).toEqual({ ok: false, error: 'validation' })

    send.mockResolvedValueOnce(object(null))
    expect(await registerPhoto('portfolio/1-b-empty.jpg')).toEqual({ ok: false, error: 'validation' })

    send.mockResolvedValueOnce(object(await jpeg(10, 10), { ContentLength: MAX_UPLOAD_BYTES + 1 }))
    expect(await registerPhoto('portfolio/1-c-huge.jpg')).toEqual({ ok: false, error: 'validation' })
    expect(await db.photo.count()).toBe(0)
  })

  it('does not register the same object twice', async () => {
    send.mockResolvedValue(object(await jpeg(50, 50)))
    expect((await registerPhoto('portfolio/1-a-same.jpg')).ok).toBe(true)
    expect(await registerPhoto('portfolio/1-a-same.jpg')).toEqual({ ok: false, error: 'conflict' })
    expect(await db.photo.count()).toBe(1)
  })

  it('refuses without an admin session and reports storage failures', async () => {
    assertAdmin.mockRejectedValue(new UnauthorizedError())
    expect(await registerPhoto('portfolio/1-a-x.jpg')).toEqual({ ok: false, error: 'unauthorized' })
    expect(send).not.toHaveBeenCalled()

    assertAdmin.mockResolvedValue({ user: { email: 'admin@example.com' } })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    send.mockRejectedValue(new Error('NoSuchKey'))
    expect(await registerPhoto('portfolio/1-a-missing.jpg')).toEqual({ ok: false, error: 'failed' })
    error.mockRestore()
  })
})
