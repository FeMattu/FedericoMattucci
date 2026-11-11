import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { db, resetDatabase } from './helpers'

const { assertAdmin, revalidatePath } = vi.hoisted(() => ({ assertAdmin: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('@/lib/auth/session', () => {
  class UnauthorizedError extends Error {
    readonly status = 401
  }
  return { assertAdmin, UnauthorizedError }
})

import { saveSiteText } from '@/actions/admin-site'

beforeEach(async () => {
  assertAdmin.mockReset().mockResolvedValue({ user: { email: 'admin@example.com' } })
  revalidatePath.mockReset()
  await resetDatabase()
})

afterAll(() => db.$disconnect())

describe('the profile photo setting (hero.avatar)', () => {
  it('stores a profile storage key and replaces it on the next save', async () => {
    expect(await saveSiteText('hero.avatar', { it: 'profile/1-a-me.jpg' })).toEqual({ ok: true, data: undefined })
    expect((await db.siteText.findUniqueOrThrow({ where: { key: 'hero.avatar' } })).value).toEqual({ it: 'profile/1-a-me.jpg' })

    await saveSiteText('hero.avatar', { it: 'profile/2-b-new.jpg' })
    expect(await db.siteText.count()).toBe(1)
  })

  it('removes the setting when the photo is cleared', async () => {
    await saveSiteText('hero.avatar', { it: 'profile/1-a-me.jpg' })
    expect(await saveSiteText('hero.avatar', {})).toEqual({ ok: true, data: undefined })
    expect(await db.siteText.count()).toBe(0)
  })

  it.each([
    ['another prefix', { it: 'portfolio/a.jpg' }],
    ['a path escape', { it: 'profile/../portfolio/a.jpg' }],
    ['a URL', { it: 'https://evil.example/profile/a.jpg' }],
    ['plain text', { it: 'hello' }],
    ['a bad key in a second language', { it: 'profile/ok.jpg', en: 'projects/x.jpg' }],
  ])('refuses %s: a text field must never become a way to sign other objects', async (_label, value) => {
    expect(await saveSiteText('hero.avatar', value)).toEqual({ ok: false, error: 'validation' })
    expect(await db.siteText.count()).toBe(0)
  })

  it('does not apply the key check to ordinary texts', async () => {
    expect(await saveSiteText('hero.role', { it: 'Sviluppatore' })).toEqual({ ok: true, data: undefined })
  })
})
