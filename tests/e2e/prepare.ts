import { execSync } from 'node:child_process'
import { PrismaClient } from '@prisma/client'

/**
 * Prepares the E2E database: migrated, emptied, seeded with the CV content,
 * plus one admin user with a ready session (so tests do not need GitHub).
 * Refuses to touch a database whose name does not contain "test".
 */
export const E2E_ADMIN_EMAIL = 'e2e-admin@example.com'
export const E2E_SESSION_TOKEN = 'e2e-admin-token'
export const E2E_SIGNOUT_TOKEN = 'e2e-signout-token'

async function main() {
  const url = process.env.DATABASE_URL ?? ''
  const database = new URL(url).pathname.replace(/^\//, '')
  if (!/test/i.test(database)) throw new Error(`Refusing to prepare "${database}": its name must contain "test".`)

  execSync('npx prisma migrate deploy', { stdio: 'inherit' })

  const db = new PrismaClient()
  try {
    await db.$executeRawUnsafe(
      'TRUNCATE "Experience","Education","Certification","SkillCategory","Skill","Project","SocialLink","Album","Photo","Locale","SiteText","Message","Session","Account","VerificationToken","User" RESTART IDENTITY CASCADE',
    )
  } finally {
    await db.$disconnect()
  }

  execSync('npx prisma db seed', { stdio: 'inherit' })

  const after = new PrismaClient()
  try {
    const user = await after.user.create({ data: { email: E2E_ADMIN_EMAIL, name: 'E2E Admin' } })
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await after.session.create({ data: { sessionToken: E2E_SESSION_TOKEN, userId: user.id, expires } })
    // Signing out deletes the session row, so the sign-out test gets one of its own.
    await after.session.create({ data: { sessionToken: E2E_SIGNOUT_TOKEN, userId: user.id, expires } })
  } finally {
    await after.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
