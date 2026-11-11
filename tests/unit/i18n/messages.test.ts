import { describe, expect, it } from 'vitest'
import enMessages from '@/i18n/messages/en.json'
import itMessages from '@/i18n/messages/it.json'

function keys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
}

describe('message files', () => {
  it('have exactly the same keys in every locale', () => {
    expect(keys(itMessages).sort()).toEqual(keys(enMessages).sort())
  })

  it('have no empty strings', () => {
    const empty = (m: unknown) => JSON.stringify(m).includes('""')
    expect(empty(enMessages)).toBe(false)
    expect(empty(itMessages)).toBe(false)
  })
})
