// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { cdnUrl, cdnUrls } from '@/lib/storage/cdn'
import { signedUrlExpiry } from '@/lib/storage/signing'

const now = new Date('2026-11-11T12:00:00Z')

describe('cdnUrl', () => {
  it('signs a CloudFront URL with the key pair and a day-rounded expiry', () => {
    const url = new URL(cdnUrl('portfolio/a b/photo (1).jpg', now))
    expect(url.origin).toBe('https://cdn.test.example')
    expect(url.pathname).toBe('/portfolio/a%20b/photo%20(1).jpg')
    expect(url.searchParams.get('Key-Pair-Id')).toBe('KTESTPAIR')
    expect(url.searchParams.get('Signature')).toBeTruthy()
    expect(Number(url.searchParams.get('Expires'))).toBe(Math.floor(signedUrlExpiry(now).getTime() / 1000))
  })

  it('gives the same URL for the same key within a day (stable image cache)', () => {
    const morning = cdnUrl('portfolio/a.jpg', new Date('2026-11-11T01:00:00Z'))
    const evening = cdnUrl('portfolio/a.jpg', new Date('2026-11-11T22:00:00Z'))
    expect(morning).toBe(evening)
  })

  it.each(['../secret', '/abs.jpg', 'https://evil.com/x', 'a//b', ''])('refuses the unsafe key %j', (key) => {
    expect(() => cdnUrl(key, now)).toThrow('Unsafe storage key')
  })
})

describe('cdnUrls when signing is broken', () => {
  it('skips the key and logs, instead of throwing', async () => {
    const original = process.env.CLOUDFRONT_PRIVATE_KEY
    process.env.CLOUDFRONT_PRIVATE_KEY = 'not-a-real-key'
    vi.resetModules()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { cdnUrls: broken } = await import('@/lib/storage/cdn')
      expect(broken(['portfolio/a.jpg'])).toEqual({})
      expect(error).toHaveBeenCalled()
    } finally {
      process.env.CLOUDFRONT_PRIVATE_KEY = original
      error.mockRestore()
      vi.resetModules()
    }
  })
})

describe('cdnUrls', () => {
  it('maps keys to URLs, skipping duplicates, empties and unsafe keys', () => {
    const urls = cdnUrls(['portfolio/a.jpg', 'portfolio/a.jpg', null, undefined, '', '../x', 'projects/b.png'])
    expect(Object.keys(urls)).toEqual(['portfolio/a.jpg', 'projects/b.png'])
    expect(urls['projects/b.png']).toContain('cdn.test.example/projects/b.png')
  })
})
