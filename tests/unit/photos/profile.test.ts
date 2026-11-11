import { describe, expect, it } from 'vitest'
import { SITE_IMAGE_KEYS, SITE_TEXT_FIELDS, isSiteTextKey } from '@/lib/admin/site-texts'
import { buildObjectKey, isPhotoKey, isProfileKey, validateUploadRequest } from '@/lib/uploads/validate'

describe('profile uploads', () => {
  const request = { purpose: 'profile', filename: 'Me & my face.JPG', contentType: 'image/jpeg', size: 4096 } as const

  it('accepts the profile purpose and writes under the profile prefix', () => {
    expect(validateUploadRequest(request)).toEqual({ ok: true, data: request })
    const key = buildObjectKey(request, new Date('2026-11-11T12:00:00Z'), 'ab12cd34')
    expect(key).toMatch(/^profile\/\d+-ab12cd34-me-my-face\.jpg$/)
    expect(isProfileKey(key)).toBe(true)
  })

  it('keeps the prefixes apart: a profile key is not a photo key and vice versa', () => {
    expect(isProfileKey('profile/profile.jpg')).toBe(true)
    expect(isPhotoKey('profile/profile.jpg')).toBe(false)
    expect(isProfileKey('portfolio/a.jpg')).toBe(false)
  })

  it.each(['', 'profile', 'profile/', '/profile/a.jpg', 'profile/../portfolio/a.jpg', 'profile//a.jpg', 'https://x/profile/a.jpg', 42, null])(
    'rejects %j as a profile key',
    (key) => {
      expect(isProfileKey(key)).toBe(false)
    },
  )
})

describe('site text fields', () => {
  it('knows the avatar as an image setting, not a translatable text', () => {
    expect(isSiteTextKey('hero.avatar')).toBe(true)
    expect(SITE_IMAGE_KEYS).toEqual(['hero.avatar'])
    expect(SITE_TEXT_FIELDS.filter((f) => 'image' in f).map((f) => f.key)).toEqual(['hero.avatar'])
  })
})
