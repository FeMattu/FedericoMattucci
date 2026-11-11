import { describe, expect, it } from 'vitest'
import { formatPeriod } from '@/lib/dates'
import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('lowercases, strips accents and collapses separators', () => {
    expect(slugify('  Hastega (Demcode Srl SB) ')).toBe('hastega-demcode-srl-sb')
    expect(slugify('Università di Pisa')).toBe('universita-di-pisa')
  })

  it('caps the length', () => {
    expect(slugify('a'.repeat(200))).toHaveLength(80)
  })
})

describe('formatPeriod', () => {
  const start = new Date(Date.UTC(2026, 1, 1))
  const end = new Date(Date.UTC(2026, 8, 1))

  it('formats a closed period', () => {
    expect(formatPeriod(start, end, 'en', 'Present')).toBe('Feb 2026 – Sep 2026')
  })

  it('uses the present label for an open period', () => {
    expect(formatPeriod(start, null, 'en', 'Present')).toBe('Feb 2026 – Present')
  })
})
