import { describe, expect, it } from 'vitest'
import { RESOURCES } from '@/lib/admin/resources'
import { missingTranslations, sumCounts } from '@/lib/admin/translation-status'

describe('missingTranslations', () => {
  const def = RESOURCES.experience // localized: role, summary, description, highlights
  const codes = ['it', 'en', 'fr']

  it('counts values present in the default language but empty in another', () => {
    const rows = [
      { role: { it: 'Capo', en: 'Head' }, summary: { it: 'Riassunto' }, description: null, highlights: { it: ['uno'] } },
    ]
    expect(missingTranslations(def, rows, codes, 'it')).toEqual({ it: 0, en: 2, fr: 3 })
  })

  it('ignores values nobody wrote in the default language', () => {
    expect(missingTranslations(def, [{ role: { en: 'Head' } }], codes, 'it')).toEqual({ it: 0, en: 0, fr: 0 })
  })

  it('treats blank strings and empty lists as missing', () => {
    const rows = [{ role: { it: 'Capo', en: '   ' }, highlights: { it: ['uno'], en: [' '] } }]
    expect(missingTranslations(def, rows, ['it', 'en'], 'it')).toEqual({ it: 0, en: 2 })
  })

  it('is empty for resources without translatable fields and for no rows', () => {
    expect(missingTranslations(RESOURCES['social-links'], [{ label: 'x' }], codes, 'it')).toEqual({ it: 0, en: 0, fr: 0 })
    expect(missingTranslations(def, [], codes, 'it')).toEqual({ it: 0, en: 0, fr: 0 })
  })
})

describe('sumCounts', () => {
  it('adds per-language counts', () => {
    expect(sumCounts([{ en: 1, fr: 2 }, { en: 3 }, {}])).toEqual({ en: 4, fr: 2 })
  })
})
