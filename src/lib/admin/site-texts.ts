/** The free-form translatable texts the public site reads (SiteText rows). */
export const SITE_TEXT_FIELDS = [
  { key: 'hero.role', label: 'Hero: role', multiline: false },
  { key: 'hero.location', label: 'Hero: location', multiline: false },
  { key: 'about.bio', label: 'About: bio', multiline: true },
  { key: 'about.interests', label: 'About: interests', multiline: true },
  { key: 'seo.home.description', label: 'SEO: home page description', multiline: true },
  {
    key: 'cv.url',
    label: 'CV download link',
    multiline: false,
    help: 'Per language. When set, the hero shows a "Download CV" button. Example: /cv-en.pdf',
  },
] as const satisfies readonly { key: string; label: string; multiline: boolean; help?: string }[]

export type SiteTextKey = (typeof SITE_TEXT_FIELDS)[number]['key']

export function isSiteTextKey(value: string): value is SiteTextKey {
  return SITE_TEXT_FIELDS.some((f) => f.key === value)
}

/** "it", "en", "pt-BR": 2-3 lowercase letters, optional uppercase region. */
const LOCALE_CODE = /^[a-z]{2,3}(-[A-Z]{2})?$/

export function isValidLocaleCode(value: string): boolean {
  return LOCALE_CODE.test(value)
}
