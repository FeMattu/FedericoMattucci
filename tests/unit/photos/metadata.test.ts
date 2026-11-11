import { describe, expect, it } from 'vitest'
import { albumSlugFromKey, compactExif, parseExifDate, parseSidecar } from '@/lib/photos/metadata'

describe('parseExifDate', () => {
  it('parses the EXIF wall-clock format', () => {
    expect(parseExifDate('2023:07:25 20:21:15')?.toISOString()).toBe('2023-07-25T20:21:15.000Z')
  })

  it.each([undefined, null, '', 'None', '2023-07-25', '2023:13:45 10:00:00', 42])('rejects %j', (value) => {
    expect(parseExifDate(value)).toBeUndefined()
  })
})

describe('parseSidecar', () => {
  const sidecar = {
    width: 4000,
    height: 3000,
    blurDataUrl: 'data:image/jpeg;base64,AAAA',
    exif: {
      make: 'SONY',
      model: 'ILCE-7M3',
      lens_model: 'FE 35mm F1.8',
      aperture: 'f/1.8',
      exposure_time: '1/250',
      iso: '100',
      datetime_original: '2023:07:25 20:21:15',
      gps: { latitude: 43.84, longitude: 10.5 },
    },
  }

  it('maps the Lambda sidecar to the stored shape', () => {
    const parsed = parseSidecar(sidecar)
    expect(parsed).toMatchObject({
      width: 4000,
      height: 3000,
      blurDataUrl: 'data:image/jpeg;base64,AAAA',
      exif: { make: 'SONY', lensModel: 'FE 35mm F1.8', aperture: 'f/1.8', exposureTime: '1/250', iso: 100 },
    })
    expect(parsed.takenAt?.toISOString()).toBe('2023-07-25T20:21:15.000Z')
    expect(parsed.exif.gps).toEqual({ latitude: 43.84, longitude: 10.5 })
  })

  it('drops "None", blank and non-image blur values', () => {
    const parsed = parseSidecar({ blurDataUrl: 'javascript:alert(1)', exif: { make: 'None', model: '  ', iso: 'abc' } })
    expect(parsed.blurDataUrl).toBeUndefined()
    expect(compactExif(parsed.exif)).toBeNull()
  })

  it('tolerates garbage input', () => {
    expect(parseSidecar(null).exif).toBeDefined()
    expect(parseSidecar('x').width).toBeUndefined()
    expect(parseSidecar([]).height).toBeUndefined()
  })
})

describe('compactExif', () => {
  it('removes undefined keys and returns null when empty', () => {
    expect(compactExif({ make: 'SONY', model: undefined })).toEqual({ make: 'SONY' })
    expect(compactExif({})).toBeNull()
  })
})

describe('albumSlugFromKey', () => {
  it('uses the first folder under the prefix as album', () => {
    expect(albumSlugFromKey('portfolio/travel/a.jpg', 'portfolio')).toBe('travel')
    expect(albumSlugFromKey('portfolio/a.jpg', 'portfolio')).toBeNull()
  })
})
