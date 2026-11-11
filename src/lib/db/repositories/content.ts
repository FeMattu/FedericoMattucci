import 'server-only'
import { prisma } from '@/lib/db/prisma'

/**
 * Public-content queries. The only place (with the other repositories) that
 * touches Prisma for reading site content. Only PUBLISHED rows, ordered by `position`.
 */
const published = { status: 'PUBLISHED' } as const
const byPosition = { position: 'asc' } as const

export const contentRepository = {
  experiences: () =>
    prisma.experience.findMany({ where: published, orderBy: [{ startDate: 'desc' }, byPosition] }),
  experienceBySlug: (slug: string) =>
    prisma.experience.findFirst({ where: { slug, ...published } }),

  education: () =>
    prisma.education.findMany({ where: published, orderBy: [{ startDate: 'desc' }, byPosition] }),
  educationBySlug: (slug: string) => prisma.education.findFirst({ where: { slug, ...published } }),

  certifications: () => prisma.certification.findMany({ where: published, orderBy: byPosition }),

  skillCategories: () =>
    prisma.skillCategory.findMany({
      where: published,
      orderBy: byPosition,
      include: { skills: { where: published, orderBy: byPosition } },
    }),

  projects: () => prisma.project.findMany({ where: published, orderBy: byPosition }),
  projectBySlug: (slug: string) => prisma.project.findFirst({ where: { slug, ...published } }),

  socialLinks: () => prisma.socialLink.findMany({ where: published, orderBy: byPosition }),

  siteTexts: () => prisma.siteText.findMany(),
}
