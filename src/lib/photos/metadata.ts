/**
 * Parses the sidecar JSON written next to each photo by the upload Lambda
 * (metadata.py / lamda_function.py) into what the Photo table stores.
 * Pure and tolerant: every field is optional, bad values are dropped.
 */

export type PhotoExif = {
  make?: string
  model?: string
  lensModel?: string
  aperture?: string
  exposureTime?: string
  iso?: number
  focalLength?: string
  gps?: { latitude: number; longitude: number }
}

export type ParsedSidecar = {
  width?: number
  height?: number
  blurDataUrl?: string
  takenAt?: Date
  exif: PhotoExif
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' || trimmed === 'None' ? undefined : trimmed
}

function positiveInt(value: unknown): number | undefined {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : typeof value === 'number' ? Math.trunc(value) : NaN
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** EXIF "2023:07:25 20:21:15" (no time zone) -> a UTC Date carrying the same wall-clock time. */
export function parseExifDate(input: unknown): Date | undefined {
  const value = text(input)
  const match = value?.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/)
  if (!match) return undefined
  const [, y, mo, d, h, mi, s] = match.map(Number) as [number, number, number, number, number, number, number]
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi, s))
  return Number.isNaN(date.getTime()) || date.getUTCMonth() !== mo - 1 ? undefined : date
}

export function parseSidecar(raw: unknown): ParsedSidecar {
  const data = record(raw)
  const exif = record(data.exif)
  const gps = record(exif.gps)

  const latitude = typeof gps.latitude === 'number' ? gps.latitude : undefined
  const longitude = typeof gps.longitude === 'number' ? gps.longitude : undefined

  const blur = text(data.blurDataUrl)

  return {
    width: positiveInt(data.width),
    height: positiveInt(data.height),
    blurDataUrl: blur?.startsWith('data:image/') ? blur : undefined,
    takenAt: parseExifDate(exif.datetime_original),
    exif: {
      make: text(exif.make),
      model: text(exif.model),
      lensModel: text(exif.lens_model),
      aperture: text(exif.aperture),
      exposureTime: text(exif.exposure_time),
      iso: positiveInt(exif.iso),
      focalLength: text(exif.focal_length),
      ...(latitude !== undefined && longitude !== undefined ? { gps: { latitude, longitude } } : {}),
    },
  }
}

/** Drops undefined keys so the result is a clean JSON object for the DB. */
export function compactExif(exif: PhotoExif): PhotoExif | null {
  const entries = Object.entries(exif).filter(([, v]) => v !== undefined)
  return entries.length > 0 ? (Object.fromEntries(entries) as PhotoExif) : null
}

/** "portfolio/travel/a.jpg" -> { album: "travel" }; "portfolio/a.jpg" -> {}. */
export function albumSlugFromKey(key: string, prefix: string): string | null {
  const rest = key.startsWith(`${prefix}/`) ? key.slice(prefix.length + 1) : key
  const parts = rest.split('/')
  return parts.length > 1 ? (parts[0] ?? null) : null
}

/** 0.004 s -> "1/250", 2 s -> "2". */
export function formatExposureSeconds(seconds: unknown): string | undefined {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return undefined
  return seconds < 1 ? `1/${Math.round(1 / seconds)}` : String(Math.round(seconds * 10) / 10)
}

/**
 * Maps what exifr extracts from the image bytes (numeric EXIF values, run with
 * `reviveValues: false` so the date stays a string) to the stored shape.
 */
export function fromExifr(raw: unknown): { takenAt?: Date; exif: PhotoExif } {
  const data = record(raw)
  const iso = Array.isArray(data.ISO) ? data.ISO[0] : data.ISO
  const fNumber = typeof data.FNumber === 'number' && data.FNumber > 0 ? data.FNumber : undefined
  const focal = typeof data.FocalLength === 'number' && data.FocalLength > 0 ? data.FocalLength : undefined
  const latitude = typeof data.latitude === 'number' ? data.latitude : undefined
  const longitude = typeof data.longitude === 'number' ? data.longitude : undefined

  return {
    takenAt: parseExifDate(data.DateTimeOriginal ?? data.CreateDate),
    exif: {
      make: text(data.Make),
      model: text(data.Model),
      lensModel: text(data.LensModel),
      aperture: fNumber !== undefined ? `f/${Math.round(fNumber * 10) / 10}` : undefined,
      exposureTime: formatExposureSeconds(data.ExposureTime),
      iso: positiveInt(iso),
      focalLength: focal !== undefined ? String(Math.round(focal * 10) / 10) : undefined,
      ...(latitude !== undefined && longitude !== undefined ? { gps: { latitude, longitude } } : {}),
    },
  }
}
