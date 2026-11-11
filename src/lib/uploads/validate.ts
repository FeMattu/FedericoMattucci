import { slugify } from '@/lib/slug'
import { isSafeKey } from '@/lib/storage/signing'

/** Browser uploads go straight to S3 with a presigned URL; these rules gate what we sign. */
export const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
} as const

export type AllowedType = keyof typeof ALLOWED_TYPES
export type UploadPurpose = 'photo' | 'project'

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
/** Longest side kept for photos; larger originals are downscaled after upload. */
export const MAX_DIMENSION = 3200
export const KEY_PREFIX: Record<UploadPurpose, string> = { photo: 'portfolio', project: 'projects' }

export type UploadRequest = { purpose: UploadPurpose; filename: string; contentType: AllowedType; size: number }
export type UploadRequestError = 'purpose' | 'type' | 'size' | 'filename'

export function isAllowedType(value: unknown): value is AllowedType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ALLOWED_TYPES, value)
}

export function validateUploadRequest(
  input: unknown,
): { ok: true; data: UploadRequest } | { ok: false; error: UploadRequestError } {
  const raw = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {}
  if (raw.purpose !== 'photo' && raw.purpose !== 'project') return { ok: false, error: 'purpose' }
  if (!isAllowedType(raw.contentType)) return { ok: false, error: 'type' }
  if (typeof raw.size !== 'number' || !Number.isFinite(raw.size) || raw.size <= 0 || raw.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'size' }
  }
  if (typeof raw.filename !== 'string' || raw.filename.trim() === '' || raw.filename.length > 200) {
    return { ok: false, error: 'filename' }
  }
  return {
    ok: true,
    data: { purpose: raw.purpose, filename: raw.filename, contentType: raw.contentType, size: raw.size },
  }
}

/** "My Photo (1).JPG" -> "my-photo-1" (extension comes from the content type, not the name). */
export function safeBaseName(filename: string): string {
  const withoutExtension = filename.replace(/\.[^./\\]+$/, '')
  return slugify(withoutExtension) || 'image'
}

/** `<prefix>/<timestamp>-<random>-<name>.<ext>`: unique, sortable, no user-controlled path parts. */
export function buildObjectKey(request: UploadRequest, now: Date, random: string): string {
  const ext = ALLOWED_TYPES[request.contentType]
  const suffix = random.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase() || 'x'
  return `${KEY_PREFIX[request.purpose]}/${now.getTime()}-${suffix}-${safeBaseName(request.filename)}.${ext}`
}

/** A key we may register as a photo: under the photo prefix and structurally safe. */
export function isPhotoKey(key: unknown): key is string {
  return typeof key === 'string' && key.startsWith(`${KEY_PREFIX.photo}/`) && isSafeKey(key)
}

export function isProjectKey(key: unknown): key is string {
  return typeof key === 'string' && key.startsWith(`${KEY_PREFIX.project}/`) && isSafeKey(key)
}
