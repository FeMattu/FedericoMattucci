import { PrismaClient } from '@prisma/client'

/** One client for the whole test file; it points at the TEST database (see vitest.config.mts). */
export const db = new PrismaClient()

const TABLES = [
  'Experience',
  'Education',
  'Certification',
  'SkillCategory',
  'Skill',
  'Project',
  'SocialLink',
  'Album',
  'Photo',
  'Locale',
  'SiteText',
  'Message',
]

/** Empty every content table and restore the two base languages. */
export async function resetDatabase() {
  await db.$executeRawUnsafe(`TRUNCATE ${TABLES.map((t) => `"${t}"`).join(',')} RESTART IDENTITY CASCADE`)
  await db.locale.createMany({
    data: [
      { code: 'it', name: 'Italiano', isDefault: true, position: 0 },
      { code: 'en', name: 'English', position: 1 },
    ],
  })
}

export const civil = (year: number, month: number, day = 1) => new Date(Date.UTC(year, month - 1, day))
