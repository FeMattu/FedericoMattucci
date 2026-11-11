/**
 * Pure helpers for CloudFront signed URLs (no I/O, unit-tested).
 *
 * Signed URLs end up inside statically generated pages, so they must (a) stay
 * valid until the page is revalidated and (b) stay identical between renders
 * so the Next image cache keeps hitting. Hence: the expiry is rounded to a UTC
 * day boundary and valid for `days` days (pages revalidate daily).
 */
export const SIGNED_URL_DAYS = 8

/** Midnight UTC of today + `days`. */
export function signedUrlExpiry(now: Date, days: number = SIGNED_URL_DAYS): Date {
  const startOfDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return new Date(startOfDay + days * 24 * 60 * 60 * 1000)
}

/**
 * Private keys live in a single-line env var with literal `\n` sequences.
 * (The old code did `.replace(/\n/g, '\n')`, a no-op.)
 */
export function normalizePrivateKey(raw: string): string {
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw
}

/** Joins the CDN base URL and an object key without double slashes. */
export function resourceUrl(base: string, key: string): string {
  const path = key
    .replace(/^\/+/, '')
    .split('/')
    .map(encodeURIComponent)
    .join('/')
  return `${base.replace(/\/+$/, '')}/${path}`
}

/** Object keys accepted from the database: no traversal, no scheme, no empty segments. */
export function isSafeKey(key: string): boolean {
  if (!key || key.length > 512) return false
  if (key.startsWith('/') || key.includes('\\') || /^[a-z][a-z0-9+.-]*:/i.test(key)) return false
  return key.split('/').every((part) => part !== '' && part !== '.' && part !== '..')
}
