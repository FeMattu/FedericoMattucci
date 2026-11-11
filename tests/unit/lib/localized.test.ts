import { describe, expect, it } from 'vitest'
import { localize, localizeList, missingLocales } from '@/lib/i18n/localized'

describe('localize', () => {
  it('returns the requested locale', () => {
    expect(localize({ it: 'Ciao', en: 'Hello' }, 'en')).toBe('Hello')
  })

  it('falls back to the default locale when the locale is missing or blank', () => {
    expect(localize({ it: 'Ciao' }, 'en')).toBe('Ciao')
    expect(localize({ it: 'Ciao', en: '   ' }, 'en')).toBe('Ciao')
  })

  it('falls back to any translation when the default is missing too', () => {
    expect(localize({ fr: 'Salut' }, 'en')).toBe('Salut')
  })

  it('passes plain strings through and tolerates bad input', () => {
    expect(localize('plain', 'en')).toBe('plain')
    expect(localize(null, 'en')).toBe('')
    expect(localize(42, 'en')).toBe('')
    expect(localize(['x'], 'en')).toBe('')
  })

  it('honours an explicit fallback locale', () => {
    expect(localize({ it: 'Ciao', en: 'Hello' }, 'fr', 'en')).toBe('Hello')
  })
})

describe('localizeList', () => {
  it('picks the locale list, then the default, then empty', () => {
    expect(localizeList({ it: ['a'], en: ['b'] }, 'en')).toEqual(['b'])
    expect(localizeList({ it: ['a'] }, 'en')).toEqual(['a'])
    expect(localizeList({ en: ['b'] }, 'fr')).toEqual([])
    expect(localizeList(null, 'en')).toEqual([])
  })
})

describe('missingLocales', () => {
  it('lists locales without a non-empty translation', () => {
    expect(missingLocales({ it: 'x', en: '' }, ['it', 'en', 'fr'])).toEqual(['en', 'fr'])
    expect(missingLocales(null, ['it', 'en'])).toEqual(['it', 'en'])
  })
})
