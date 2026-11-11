import { describe, expect, it } from 'vitest'
import { formatExposureSeconds, fromExifr } from '@/lib/photos/metadata'
import {
  MAX_UPLOAD_BYTES,
  buildObjectKey,
  isPhotoKey,
  isProjectKey,
  safeBaseName,
  validateUploadRequest,
} from '@/lib/uploads/validate'

const ok = { purpose: 'photo', filename: 'My Photo (1).JPG', contentType: 'image/jpeg', size: 1024 }

describe('validateUploadRequest', () => {
  it('accepts a valid request', () => {
    expect(validateUploadRequest(ok)).toEqual({ ok: true, data: ok })
  })

  it.each([
    [{ ...ok, purpose: 'avatar' }, 'purpose'],
    [{ ...ok, purpose: undefined }, 'purpose'],
    [{ ...ok, contentType: 'image/svg+xml' }, 'type'],
    [{ ...ok, contentType: 'application/pdf' }, 'type'],
    [{ ...ok, contentType: 'toString' }, 'type'],
    [{ ...ok, size: 0 }, 'size'],
    [{ ...ok, size: MAX_UPLOAD_BYTES + 1 }, 'size'],
    [{ ...ok, size: Number.NaN }, 'size'],
    [{ ...ok, size: '100' }, 'size'],
    [{ ...ok, filename: '  ' }, 'filename'],
    [{ ...ok, filename: 'x'.repeat(201) }, 'filename'],
    [null, 'purpose'],
  ])('rejects %j with %s', (input, error) => {
    expect(validateUploadRequest(input)).toEqual({ ok: false, error })
  })

  it('accepts the maximum size exactly', () => {
    expect(validateUploadRequest({ ...ok, size: MAX_UPLOAD_BYTES }).ok).toBe(true)
  })
})

describe('object keys', () => {
  const request = { purpose: 'photo', filename: 'My Photo (1).JPG', contentType: 'image/png', size: 1 } as const
  const now = new Date('2026-11-11T12:00:00Z')

  it('builds a unique, safe key under the purpose prefix with the extension of the content type', () => {
    const key = buildObjectKey(request, now, 'ABCD-1234-zzzz')
    expect(key).toBe(`portfolio/${now.getTime()}-abcd1234-my-photo-1.png`)
    expect(isPhotoKey(key)).toBe(true)
    expect(isProjectKey(key)).toBe(false)
  })

  it('never lets the file name choose the path', () => {
    const key = buildObjectKey({ ...request, filename: '../../etc/passwd.jpg' }, now, 'x')
    expect(key.startsWith('portfolio/')).toBe(true)
    expect(key).not.toContain('..')
    expect(key.split('/')).toHaveLength(2)
  })

  it('uses the project prefix for project images', () => {
    expect(buildObjectKey({ ...request, purpose: 'project' }, now, 'r')).toMatch(/^projects\//)
  })

  it('falls back to a generic name', () => {
    expect(safeBaseName('....jpg')).toBe('image')
    expect(safeBaseName('日本.png')).toBe('image')
  })

  it('only accepts photo keys under the photo prefix', () => {
    expect(isPhotoKey('portfolio/a/b.jpg')).toBe(true)
    for (const bad of ['projects/a.jpg', 'portfolio/../x.jpg', '/portfolio/a.jpg', 'portfolio//a.jpg', 42, null]) {
      expect(isPhotoKey(bad)).toBe(false)
    }
  })
})

describe('fromExifr', () => {
  it('maps numeric EXIF values to the stored shape', () => {
    const { takenAt, exif } = fromExifr({
      Make: 'SONY',
      Model: 'ILCE-7M2',
      LensModel: 'FE 35mm F1.8',
      FNumber: 1.8,
      ExposureTime: 0.004,
      ISO: 400,
      FocalLength: 35,
      DateTimeOriginal: '2023:07:25 20:21:15',
      latitude: 43.84,
      longitude: 10.5,
    })
    expect(exif).toEqual({
      make: 'SONY',
      model: 'ILCE-7M2',
      lensModel: 'FE 35mm F1.8',
      aperture: 'f/1.8',
      exposureTime: '1/250',
      iso: 400,
      focalLength: '35',
      gps: { latitude: 43.84, longitude: 10.5 },
    })
    expect(takenAt?.toISOString()).toBe('2023-07-25T20:21:15.000Z')
  })

  it('handles array ISO values, missing data and garbage', () => {
    expect(fromExifr({ ISO: [200, 400] }).exif.iso).toBe(200)
    expect(fromExifr(undefined).exif.make).toBeUndefined()
    expect(fromExifr({ FNumber: 0, FocalLength: -1, ExposureTime: 'fast' }).exif).toMatchObject({
      aperture: undefined,
      focalLength: undefined,
      exposureTime: undefined,
    })
  })
})

describe('formatExposureSeconds', () => {
  it('formats fractions and long exposures', () => {
    expect(formatExposureSeconds(0.004)).toBe('1/250')
    expect(formatExposureSeconds(0.5)).toBe('1/2')
    expect(formatExposureSeconds(2)).toBe('2')
    expect(formatExposureSeconds(2.46)).toBe('2.5')
    expect(formatExposureSeconds(0)).toBeUndefined()
    expect(formatExposureSeconds(undefined)).toBeUndefined()
  })
})
