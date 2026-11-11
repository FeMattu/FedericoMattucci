import 'server-only'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { env } from '@/env'
import { isSafeKey, normalizePrivateKey, resourceUrl, signedUrlExpiry } from './signing'

/**
 * Signs a CloudFront URL for an object key stored in OUR database.
 * Callers pass keys read from the DB (Photo.key, Project.coverKey, ...), never
 * raw user input: this replaces the old unauthenticated `/api/image`.
 */
export function cdnUrl(key: string, now: Date = new Date()): string {
  if (!isSafeKey(key)) throw new Error('Unsafe storage key')
  const e = env('storage')
  return getSignedUrl({
    url: resourceUrl(e.CLOUDFRONT_URL, key),
    keyPairId: e.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: normalizePrivateKey(e.CLOUDFRONT_PRIVATE_KEY),
    dateLessThan: signedUrlExpiry(now),
  })
}

/**
 * key -> URL for a list of keys. Invalid keys, and keys that cannot be signed
 * (a misconfigured CloudFront key, say), are skipped and logged: one missing
 * picture must never take a whole page, or the build, down.
 */
export function cdnUrls(keys: readonly (string | null | undefined)[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of keys) {
    if (!key || out[key] || !isSafeKey(key)) continue
    try {
      out[key] = cdnUrl(key)
    } catch (error) {
      console.error(`Could not sign "${key}":`, error instanceof Error ? error.message : error)
    }
  }
  return out
}
