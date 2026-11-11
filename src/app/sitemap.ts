import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import { listSlugs } from '@/lib/content'

const base = () => (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

/** One entry per page and locale, each with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listSlugs()
  const paths = [
    '',
    ...slugs.experiences.map((s) => `/experience/${s}`),
    ...slugs.education.map((s) => `/education/${s}`),
    ...slugs.projects.map((s) => `/projects/${s}`),
  ]

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${base()}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base()}/${l}${path}`])),
      },
    })),
  )
}
