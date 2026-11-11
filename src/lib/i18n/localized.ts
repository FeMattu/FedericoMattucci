import { defaultLocale } from '@/i18n/config'

/** Translatable DB text: { "it": "...", "en": "..." } */
export type LocalizedText = Record<string, string | undefined>
export type LocalizedList = Record<string, string[] | undefined>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Resolves a translatable value for a locale, falling back to the default
 * locale, then to any non-empty translation. Empty strings count as missing.
 */
export function localize(value: unknown, locale: string, fallback: string = defaultLocale): string {
  if (typeof value === 'string') return value
  if (!isRecord(value)) return ''
  const pick = (code: string) => {
    const v = value[code]
    return typeof v === 'string' && v.trim() !== '' ? v : undefined
  }
  const direct = pick(locale) ?? pick(fallback)
  if (direct !== undefined) return direct
  for (const code of Object.keys(value)) {
    const v = pick(code)
    if (v !== undefined) return v
  }
  return ''
}

export function localizeList(value: unknown, locale: string, fallback: string = defaultLocale): string[] {
  if (!isRecord(value)) return []
  const pick = (code: string) => {
    const v = value[code]
    return Array.isArray(v) && v.length > 0 ? v.filter((x): x is string => typeof x === 'string') : undefined
  }
  return pick(locale) ?? pick(fallback) ?? []
}

/** Locales (out of `locales`) for which a translatable value has no text yet. */
export function missingLocales(value: unknown, locales: readonly string[]): string[] {
  if (!isRecord(value)) return [...locales]
  return locales.filter((code) => {
    const v = value[code]
    return !(typeof v === 'string' && v.trim() !== '')
  })
}
