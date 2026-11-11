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

/** key -> URL for a list of keys; invalid keys are skipped instead of failing the page. */
export function cdnUrls(keys: readonly (string | null | undefined)[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of keys) {
    if (!key || out[key] || !isSafeKey(key)) continue
    out[key] = cdnUrl(key)
  }
  return out
}
