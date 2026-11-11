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

/** localStorage flag: "an admin signed in on this browser" (UI hint only, never trusted by the server). */
export const ADMIN_HINT_KEY = 'site-admin-hint'

/** The admin section that edits what the current public page shows (pathname without locale). */
export function adminHrefFor(pathname: string): string {
  if (pathname.startsWith('/experience')) return '/admin/experience'
  if (pathname.startsWith('/education')) return '/admin/education'
  if (pathname.startsWith('/projects')) return '/admin/projects'
  if (pathname.startsWith('/photos')) return '/admin/photos'
  return '/admin/site-texts'
}
