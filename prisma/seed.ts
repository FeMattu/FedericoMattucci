import { PrismaClient } from '@prisma/client'
import {
  certifications,
  draftProjects,
  education,
  experiences,
  locales,
  siteTexts,
  skillCategories,
  socialLinks,
  spokenLanguages,
  spokenLanguagesCategory,
} from './seed-data'
import { slugify } from '../src/lib/slug'

const prisma = new PrismaClient()

/**
 * Idempotent: every row is created only if it does not exist yet
 * (`upsert` with an empty `update`), so re-running never overwrites content
 * edited from the admin.
 */
async function main() {
  for (const l of locales) {
    await prisma.locale.upsert({ where: { code: l.code }, update: {}, create: l })
  }

  for (const [key, value] of Object.entries(siteTexts)) {
    await prisma.siteText.upsert({ where: { key }, update: {}, create: { key, value } })
  }

  for (const [position, e] of experiences.entries()) {
    const { slug, ...rest } = e
    await prisma.experience.upsert({
      where: { slug },
      update: {},
      create: { slug, ...rest, position, status: 'PUBLISHED' },
    })
  }

  for (const [position, e] of education.entries()) {
    const { slug, ...rest } = e
    await prisma.education.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        ...rest,
        summary: rest.summary ?? undefined,
        highlights: rest.highlights ?? undefined,
        position,
        status: 'PUBLISHED',
      },
    })
  }

  for (const [position, c] of certifications.entries()) {
    await prisma.certification.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, position, status: 'PUBLISHED' },
    })
  }

  for (const [position, c] of skillCategories.entries()) {
    const category = await prisma.skillCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: { slug: c.slug, name: c.name, position, status: 'PUBLISHED' },
    })
    for (const [i, name] of c.skills.entries()) {
      await prisma.skill.upsert({
        where: { slug: `${c.slug}-${slugify(name)}` },
        update: {},
        create: { slug: `${c.slug}-${slugify(name)}`, name, categoryId: category.id, position: i },
      })
    }
  }

  const langCategory = await prisma.skillCategory.upsert({
    where: { slug: spokenLanguagesCategory.slug },
    update: {},
    create: { ...spokenLanguagesCategory, position: skillCategories.length, status: 'PUBLISHED' },
  })
  for (const [i, s] of spokenLanguages.entries()) {
    await prisma.skill.upsert({
      where: { slug: `${langCategory.slug}-${s.slug}` },
      update: {},
      create: {
        slug: `${langCategory.slug}-${s.slug}`,
        name: s.name,
        description: s.description,
        categoryId: langCategory.id,
        position: i,
      },
    })
  }

  for (const [position, s] of socialLinks.entries()) {
    const existing = await prisma.socialLink.findFirst({ where: { kind: s.kind } })
    if (!existing) await prisma.socialLink.create({ data: { ...s, position, status: 'PUBLISHED' } })
  }

  for (const [position, p] of draftProjects.entries()) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: { slug: p.slug, title: p.title, summary: {}, position, status: 'DRAFT' },
    })
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
