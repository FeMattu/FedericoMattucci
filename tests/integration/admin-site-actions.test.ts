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

import { addLocale, deleteMessage, saveSiteText, setLocaleEnabled, setMessageRead } from '@/actions/admin-site'
import { UnauthorizedError } from '@/lib/auth/session'

beforeEach(async () => {
  assertAdmin.mockReset().mockResolvedValue({ user: { email: 'admin@example.com' } })
  revalidatePath.mockReset()
  await resetDatabase()
})

afterAll(() => db.$disconnect())

describe('authorization', () => {
  it('rejects every action without an admin session and changes nothing', async () => {
    const message = await db.message.create({ data: { name: 'A', email: 'a@example.com', body: 'hello hello' } })
    assertAdmin.mockRejectedValue(new UnauthorizedError())

    const results = await Promise.all([
      saveSiteText('hero.role', { it: 'x' }),
      addLocale('fr', 'Français'),
      setLocaleEnabled('en', false),
      setMessageRead(message.id, true),
      deleteMessage(message.id),
    ])
    for (const r of results) expect(r).toEqual({ ok: false, error: 'unauthorized' })

    expect(await db.siteText.count()).toBe(0)
    expect(await db.locale.count()).toBe(2)
    expect((await db.locale.findUniqueOrThrow({ where: { code: 'en' } })).enabled).toBe(true)
    expect(await db.message.findUniqueOrThrow({ where: { id: message.id } })).toMatchObject({ read: false })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('saveSiteText', () => {
  it('stores trimmed translations, replaces them on the next save and revalidates', async () => {
    expect(await saveSiteText('hero.role', { it: '  Sviluppatore ', en: 'Developer', fr: '   ' })).toEqual({ ok: true, data: undefined })
    expect((await db.siteText.findUniqueOrThrow({ where: { key: 'hero.role' } })).value).toEqual({ it: 'Sviluppatore', en: 'Developer' })

    await saveSiteText('hero.role', { it: 'Dev' })
    expect(await db.siteText.count()).toBe(1)
    expect((await db.siteText.findUniqueOrThrow({ where: { key: 'hero.role' } })).value).toEqual({ it: 'Dev' })
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('removes the row when every translation is emptied', async () => {
    await saveSiteText('cv.url', { en: '/cv.pdf' })
    expect(await saveSiteText('cv.url', { en: '  ', it: '' })).toEqual({ ok: true, data: undefined })
    expect(await db.siteText.count()).toBe(0)
  })

  it('rejects unknown keys and malformed values', async () => {
    expect(await saveSiteText('made.up.key', { it: 'x' })).toEqual({ ok: false, error: 'notFound' })
    expect(await saveSiteText('hero.role', 'text')).toEqual({ ok: false, error: 'validation' })
    expect(await saveSiteText('hero.role', ['x'])).toEqual({ ok: false, error: 'validation' })
    expect(await saveSiteText('hero.role', null)).toEqual({ ok: false, error: 'validation' })
    expect(await db.siteText.count()).toBe(0)
  })
})

describe('languages', () => {
  it('adds a language at the end, enabled', async () => {
    expect(await addLocale('fr', ' Français ')).toEqual({ ok: true, data: undefined })
    expect(await db.locale.findUniqueOrThrow({ where: { code: 'fr' } })).toMatchObject({
      name: 'Français',
      enabled: true,
      isDefault: false,
      position: 2,
    })
  })

  it('rejects bad codes and names, and duplicates', async () => {
    for (const [code, name] of [['EN', 'x'], ['english', 'x'], ['fr', ''], ['fr', 'x'.repeat(61)], [42, 'x'], ['fr', null]] as const) {
      expect(await addLocale(code, name)).toEqual({ ok: false, error: 'validation' })
    }
    expect(await addLocale('en', 'English again')).toEqual({ ok: false, error: 'conflict' })
    expect(await db.locale.count()).toBe(2)
  })

  it('disables and re-enables a language but never the default one', async () => {
    expect(await setLocaleEnabled('en', false)).toEqual({ ok: true, data: undefined })
    expect((await db.locale.findUniqueOrThrow({ where: { code: 'en' } })).enabled).toBe(false)
    expect(await setLocaleEnabled('en', true)).toEqual({ ok: true, data: undefined })

    expect(await setLocaleEnabled('it', false)).toEqual({ ok: false, error: 'validation' })
    expect((await db.locale.findUniqueOrThrow({ where: { code: 'it' } })).enabled).toBe(true)
    expect(await setLocaleEnabled('xx', true)).toEqual({ ok: false, error: 'notFound' })
    expect(await setLocaleEnabled('en', 'no')).toEqual({ ok: false, error: 'validation' })
  })
})

describe('messages', () => {
  it('marks a message read and unread, and deletes it', async () => {
    const m = await db.message.create({ data: { name: 'A', email: 'a@example.com', body: 'hello hello' } })
    expect(await setMessageRead(m.id, true)).toEqual({ ok: true, data: undefined })
    expect((await db.message.findUniqueOrThrow({ where: { id: m.id } })).read).toBe(true)
    expect(await setMessageRead(m.id, false)).toEqual({ ok: true, data: undefined })
    expect(await setMessageRead(m.id, 'yes')).toEqual({ ok: false, error: 'validation' })

    expect(await deleteMessage(m.id)).toEqual({ ok: true, data: undefined })
    expect(await db.message.count()).toBe(0)
  })

  it('reports notFound for a message that does not exist', async () => {
    expect(await setMessageRead('missing', true)).toEqual({ ok: false, error: 'notFound' })
    expect(await deleteMessage('missing')).toEqual({ ok: false, error: 'notFound' })
  })
})
