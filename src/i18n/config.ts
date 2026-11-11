/**
 * Adding a language to the public UI = one entry here + a messages file
 * `src/i18n/messages/<code>.json` (and a row in the admin "Languages" page so
 * content can be translated).
 */
export const locales = ['it', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'it'

export const localeNames: Record<Locale, string> = { it: 'Italiano', en: 'English' }

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}
