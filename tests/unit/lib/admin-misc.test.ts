import { describe, expect, it } from 'vitest'
import { errorMessage, fieldErrorText } from '@/lib/admin/messages'
import { SITE_TEXT_FIELDS, isSiteTextKey, isValidLocaleCode } from '@/lib/admin/site-texts'
import { adminHrefFor } from '@/lib/navigation'

describe('errorMessage', () => {
  it.each([
    ['unauthorized', /session has expired/],
    ['notFound', /no longer exists/],
    ['validation', /not valid/],
    ['conflict', /already exists/],
    ['failed', /Something went wrong/],
    ['anything-else', /Something went wrong/],
  ])('%s -> readable text', (code, pattern) => {
    expect(errorMessage(code)).toMatch(pattern)
  })
})

describe('fieldErrorText', () => {
  it.each([
    ['required', /required/],
    ['requiredDefaultLocale', /default language/],
    ['invalidUrl', /https:\/\//],
    ['invalidDate', /valid date/],
    ['invalidNumber', /whole number/],
    ['invalidKey', /storage key/],
    ['unknown-code', /Invalid value/],
  ])('%s -> readable text', (code, pattern) => {
    expect(fieldErrorText(code)).toMatch(pattern)
  })
})

describe('site texts and locale codes', () => {
  it('knows exactly the keys the public site reads', () => {
    for (const field of SITE_TEXT_FIELDS) expect(isSiteTextKey(field.key)).toBe(true)
    expect(isSiteTextKey('hero.unknown')).toBe(false)
    expect(isSiteTextKey('__proto__')).toBe(false)
  })

  it.each(['it', 'en', 'fra', 'pt-BR', 'zh-CN'])('accepts locale code %s', (code) => {
    expect(isValidLocaleCode(code)).toBe(true)
  })

  it.each(['', 'E', 'english', 'EN', 'pt-br', 'pt_BR', '../x', 'it;drop', 'it '])('rejects locale code %j', (code) => {
    expect(isValidLocaleCode(code)).toBe(false)
  })
})

describe('adminHrefFor', () => {
  it('points to the editor of what the visitor is looking at', () => {
    expect(adminHrefFor('/')).toBe('/admin/site-texts')
    expect(adminHrefFor('/experience/jevis')).toBe('/admin/experience')
    expect(adminHrefFor('/education/unipi')).toBe('/admin/education')
    expect(adminHrefFor('/projects/site')).toBe('/admin/projects')
    expect(adminHrefFor('/photos')).toBe('/admin/photos')
    expect(adminHrefFor('/anything-else')).toBe('/admin/site-texts')
  })
})
