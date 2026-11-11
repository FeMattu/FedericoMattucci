import { formatPeriod } from '@/lib/dates'
import { localize, localizeList } from '@/lib/i18n/localized'

/**
 * Pure mappers: DB rows -> localized, serializable view models.
 * Rows are typed structurally so the mappers do not depend on Prisma.
 */
export type Labels = { present: string }

type ExperienceRow = {
  id: string
  slug: string
  organization: string
  role: unknown
  location: string | null
  summary: unknown
  description: unknown
  highlights: unknown
  startDate: Date
  endDate: Date | null
  url: string | null
  tags: string[]
  featured: boolean
}

export type ExperienceView = {
  id: string
  slug: string
  organization: string
  role: string
  location: string | null
  summary: string
  description: string
  highlights: string[]
  period: string
  isCurrent: boolean
  url: string | null
  tags: string[]
  featured: boolean
}

export function toExperienceView(row: ExperienceRow, locale: string, labels: Labels): ExperienceView {
  return {
    id: row.id,
    slug: row.slug,
    organization: row.organization,
    role: localize(row.role, locale),
    location: row.location,
    summary: localize(row.summary, locale),
    description: localize(row.description, locale),
    highlights: localizeList(row.highlights, locale),
    period: formatPeriod(row.startDate, row.endDate, locale, labels.present),
    isCurrent: row.endDate === null,
    url: row.url,
    tags: row.tags,
    featured: row.featured,
  }
}

type EducationRow = {
  id: string
  slug: string
  institution: string
  title: unknown
  location: string | null
  summary: unknown
  description: unknown
  highlights: unknown
  startDate: Date
  endDate: Date | null
  url: string | null
}

export type EducationView = {
  id: string
  slug: string
  institution: string
  title: string
  location: string | null
  summary: string
  description: string
  highlights: string[]
  period: string
  url: string | null
}

export function toEducationView(row: EducationRow, locale: string, labels: Labels): EducationView {
  return {
    id: row.id,
    slug: row.slug,
    institution: row.institution,
    title: localize(row.title, locale),
    location: row.location,
    summary: localize(row.summary, locale),
    description: localize(row.description, locale),
    highlights: localizeList(row.highlights, locale),
    period: formatPeriod(row.startDate, row.endDate, locale, labels.present),
    url: row.url,
  }
}

type SkillCategoryRow = {
  id: string
  slug: string
  name: unknown
  skills: {
    id: string
    slug: string
    name: string
    level: number | null
    years: number | null
    description: unknown
  }[]
}

export type SkillCategoryView = {
  id: string
  slug: string
  name: string
  skills: { id: string; slug: string; name: string; level: number | null; years: number | null; description: string }[]
}

export function toSkillCategoryView(row: SkillCategoryRow, locale: string): SkillCategoryView {
  return {
    id: row.id,
    slug: row.slug,
    name: localize(row.name, locale),
    skills: row.skills.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      level: s.level,
      years: s.years,
      description: localize(s.description, locale),
    })),
  }
}

type ProjectRow = {
  id: string
  slug: string
  title: unknown
  summary: unknown
  description: unknown
  coverKey: string | null
  gallery: string[]
  tags: string[]
  liveUrl: string | null
  repoUrl: string | null
  featured: boolean
}

export type ProjectView = {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  coverKey: string | null
  gallery: string[]
  tags: string[]
  liveUrl: string | null
  repoUrl: string | null
  featured: boolean
}

export function toProjectView(row: ProjectRow, locale: string): ProjectView {
  return {
    id: row.id,
    slug: row.slug,
    title: localize(row.title, locale),
    summary: localize(row.summary, locale),
    description: localize(row.description, locale),
    coverKey: row.coverKey,
    gallery: row.gallery,
    tags: row.tags,
    liveUrl: row.liveUrl,
    repoUrl: row.repoUrl,
    featured: row.featured,
  }
}

/** Distinct tags of a list of projects, sorted. */
export function collectTags(projects: { tags: string[] }[]): string[] {
  return [...new Set(projects.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b))
}

export function toSiteTexts(rows: { key: string; value: unknown }[], locale: string): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.key, localize(r.value, locale)]))
}
