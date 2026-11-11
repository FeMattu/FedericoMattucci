/** Public top-bar sections, in order. `id` is the home-page anchor and the i18n key under `nav`. */
export const NAV_SECTIONS = [
  'experience',
  'education',
  'skills',
  'projects',
  'photos',
  'contact',
] as const

export type NavSection = (typeof NAV_SECTIONS)[number]
