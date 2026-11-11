// @vitest-environment node
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { processImage } from '@/lib/uploads/process'

const jpeg = (width: number, height: number, options: { orientation?: number; exif?: Record<string, string> } = {}) => {
  let image = sharp({ create: { width, height, channels: 3, background: '#7799bb' } })
  if (options.exif) image = image.withExif({ IFD0: options.exif })
  if (options.orientation) image = image.withMetadata({ orientation: options.orientation })
  return image.jpeg().toBuffer()
}

describe('processImage', () => {
  it('keeps small images untouched and builds a blur placeholder', async () => {
    const input = await jpeg(800, 600)
    const result = await processImage(input)
    expect(result.resized).toBe(false)
    expect(result.buffer).toBe(input)
    expect([result.width, result.height]).toEqual([800, 600])
    expect(result.blurDataUrl).toMatch(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/)
    expect(result.blurDataUrl.length).toBeLessThan(2000)
  })

  it('downscales oversized images to the longest side, keeping the aspect ratio', async () => {
    const result = await processImage(await jpeg(4000, 2000))
    expect(result.resized).toBe(true)
    expect([result.width, result.height]).toEqual([3200, 1600])
    const stored = await sharp(result.buffer).metadata()
    expect([stored.width, stored.height]).toEqual([3200, 1600])
  })

  it('honours a custom maximum dimension', async () => {
    const result = await processImage(await jpeg(1000, 500), 400)
    expect([result.width, result.height]).toEqual([400, 200])
  })

  it('reports the dimensions a viewer sees for rotated (EXIF orientation) photos', async () => {
    const result = await processImage(await jpeg(600, 400, { orientation: 6 }))
    expect([result.width, result.height]).toEqual([400, 600])
  })

  it('extracts camera EXIF from the uploaded bytes', async () => {
    const result = await processImage(await jpeg(300, 200, { exif: { Make: 'TESTCAM', Model: 'X1' } }))
    expect(result.exif).toMatchObject({ make: 'TESTCAM', model: 'X1' })
  })

  it('returns no EXIF for an image without any', async () => {
    const result = await processImage(await jpeg(300, 200))
    expect(result.exif).toBeNull()
    expect(result.takenAt).toBeUndefined()
  })

  it('rejects bytes that are not an image', async () => {
    await expect(processImage(Buffer.from('definitely not an image'))).rejects.toThrow()
  })
})
