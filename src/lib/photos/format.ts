import type { PhotoExif } from './metadata'

/** "1/250" -> "1/250 s"; already suffixed or empty values pass through. */
export function formatExposure(value: string | undefined): string | undefined {
  if (!value) return undefined
  return /s$/i.test(value) ? value : `${value} s`
}

/** "50.0 mm" and "50" -> "50 mm". */
export function formatFocalLength(value: string | undefined): string | undefined {
  if (!value) return undefined
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? `${Math.round(n * 10) / 10} mm` : value
}

/** Date shown in the lightbox. Stored as a UTC wall-clock time, so format in UTC. */
export function formatTakenAt(iso: string | null, locale: string): string | undefined {
  if (!iso) return undefined
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(date)
}

/** Shooting settings in reading order, e.g. ["f/1.8", "1/250 s", "ISO 100", "35 mm"]. */
export function shootingSettings(exif: PhotoExif): string[] {
  return [
    exif.aperture,
    formatExposure(exif.exposureTime),
    exif.iso ? `ISO ${exif.iso}` : undefined,
    formatFocalLength(exif.focalLength),
  ].filter((v): v is string => !!v)
}

/** "SONY ILCE-7M2" without repeating the make when the model already contains it. */
export function cameraName(exif: PhotoExif): string | undefined {
  const make = exif.make?.trim()
  const model = exif.model?.trim()
  if (!model) return make
  return make && !model.toLowerCase().startsWith(make.toLowerCase()) ? `${make} ${model}` : model
}
