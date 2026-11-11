import 'server-only'
import { getTranslations } from 'next-intl/server'
import { cache } from 'react'
import { contentRepository as repo } from '@/lib/db/repositories/content'
import { photosRepository } from '@/lib/db/repositories/photos'
import { localize } from '@/lib/i18n/localized'
import { NAV_SECTIONS, type NavSection } from '@/lib/navigation'
import {
  collectTags,
  toEducationView,
  toExperienceView,
  toProjectView,
  toSiteTexts,
  toSkillCategoryView,
  type Labels,
} from './view'

async function labelsFor(locale: string): Promise<Labels> {
  const t = await getTranslations({ locale, namespace: 'common' })
  return { present: t('present') }
}

/** Everything the home page needs, localized. Cached per request. */
export const getHomeContent = cache(async (locale: string) => {
  const labels = await labelsFor(locale)
  const [experiences, education, certifications, categories, projects, socials, texts] =
    await Promise.all([
      repo.experiences(),
      repo.education(),
      repo.certifications(),
      repo.skillCategories(),
      repo.projects(),
      repo.socialLinks(),
      repo.siteTexts(),
    ])

  const projectViews = projects.map((p) => toProjectView(p, locale))
  return {
    texts: toSiteTexts(texts, locale),
    experiences: experiences.map((e) => toExperienceView(e, locale, labels)),
    education: education.map((e) => toEducationView(e, locale, labels)),
    certifications: certifications.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: localize(c.name, locale),
      issuer: c.issuer,
      url: c.url,
    })),
    skillCategories: categories.map((c) => toSkillCategoryView(c, locale)),
    projects: projectViews,
    projectTags: collectTags(projectViews),
    socials: socials.map((s) => ({ id: s.id, kind: s.kind, label: s.label ?? s.kind, url: s.url })),
  }
})

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>

export const getExperience = cache(async (locale: string, slug: string) => {
  const row = await repo.experienceBySlug(slug)
  return row ? toExperienceView(row, locale, await labelsFor(locale)) : null
})

export const getEducation = cache(async (locale: string, slug: string) => {
  const row = await repo.educationBySlug(slug)
  return row ? toEducationView(row, locale, await labelsFor(locale)) : null
})

export const getProject = cache(async (locale: string, slug: string) => {
  const row = await repo.projectBySlug(slug)
  return row ? toProjectView(row, locale) : null
})

/** Top-bar sections that actually have published content (projects/photos hide when empty). */
export const getNavSections = cache(async (): Promise<NavSection[]> => {
  const [projects, photos] = await Promise.all([repo.projects(), photosRepository.photos()])
  return NAV_SECTIONS.filter(
    (id) => (id !== 'projects' || projects.length > 0) && (id !== 'photos' || photos.length > 0),
  )
})

export async function listSlugs() {
  const [experiences, education, projects] = await Promise.all([
    repo.experiences(),
    repo.education(),
    repo.projects(),
  ])
  return {
    experiences: experiences.map((e) => e.slug),
    education: education.map((e) => e.slug),
    projects: projects.map((p) => p.slug),
  }
}
