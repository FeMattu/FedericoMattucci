import { describe, expect, it } from 'vitest'
import { isSafeKey, normalizePrivateKey, resourceUrl, signedUrlExpiry } from '@/lib/storage/signing'

describe('signedUrlExpiry', () => {
  it('is midnight UTC, 8 days ahead, and stable within a day', () => {
    const morning = new Date('2026-11-11T01:00:00Z')
    const evening = new Date('2026-11-11T23:30:00Z')
    expect(signedUrlExpiry(morning).toISOString()).toBe('2026-11-19T00:00:00.000Z')
    expect(signedUrlExpiry(evening).getTime()).toBe(signedUrlExpiry(morning).getTime())
  })

  it('outlives the daily page revalidation window', () => {
    const now = new Date('2026-11-11T23:59:59Z')
    expect(signedUrlExpiry(now).getTime() - now.getTime()).toBeGreaterThan(7 * 24 * 60 * 60 * 1000)
  })
})

describe('normalizePrivateKey', () => {
  it('turns literal \\n sequences into newlines', () => {
    expect(normalizePrivateKey('-----BEGIN-----\\nabc\\n-----END-----')).toBe('-----BEGIN-----\nabc\n-----END-----')
  })

  it('leaves a real multi-line key untouched', () => {
    expect(normalizePrivateKey('a\nb')).toBe('a\nb')
  })
})

describe('resourceUrl', () => {
  it('joins without duplicate slashes', () => {
    expect(resourceUrl('https://cdn.example.com/', '/portfolio/a.jpg')).toBe('https://cdn.example.com/portfolio/a.jpg')
  })

  it('percent-encodes each segment so names with spaces and brackets are valid URLs', () => {
    expect(resourceUrl('https://cdn.example.com', 'portfolio/portrait/DSC 02454 (1).jpg')).toBe(
      'https://cdn.example.com/portfolio/portrait/DSC%2002454%20(1).jpg',
    )
  })
})

describe('isSafeKey', () => {
  it('accepts normal object keys', () => {
    expect(isSafeKey('portfolio/2024/photo-1.jpg')).toBe(true)
  })

  it.each(['', '/abs/path.jpg', '../secret', 'a/../b', 'a//b', 'a\\b', 'https://evil.com/x', 'file:///etc/passwd'])(
    'rejects %j',
    (key) => {
      expect(isSafeKey(key)).toBe(false)
    },
  )
})
