import { PrismaClient } from '@prisma/client'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { assertAdmin, revalidatePath } = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  revalidatePath: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('@/lib/auth/session', () => {
  class UnauthorizedError extends Error {
    readonly status = 401
  }
  return { assertAdmin, UnauthorizedError }
})

import {
  deleteItem,
  duplicateItem,
  reorderItems,
  saveItem,
  setItemFeatured,
  setItemStatus,
} from '@/actions/admin'
import { UnauthorizedError } from '@/lib/auth/session'

const db = new PrismaClient()

const experience = (overrides: Record<string, unknown> = {}) => ({
  organization: 'JEVIS',
  role: { it: 'Responsabile IT', en: 'IT Head' },
  startDate: '2026-02-01',
  summary: { it: 'Riassunto' },
  ...overrides,
})

async function reset() {
  await db.$executeRawUnsafe(
    'TRUNCATE "Experience","Education","Certification","SkillCategory","Skill","Project","SocialLink","Album","Photo","Locale","SiteText","Message" RESTART IDENTITY CASCADE',
  )
  await db.locale.createMany({
    data: [
      { code: 'it', name: 'Italiano', isDefault: true, position: 0 },
      { code: 'en', name: 'English', position: 1 },
    ],
  })
}

beforeEach(async () => {
  assertAdmin.mockReset()
  assertAdmin.mockResolvedValue({ user: { email: 'admin@example.com' } })
  revalidatePath.mockReset()
  await reset()
})

afterAll(async () => {
  await db.$disconnect()
})

describe('authorization', () => {
  it('rejects every write without an admin session and touches nothing', async () => {
    assertAdmin.mockRejectedValue(new UnauthorizedError())
    const results = await Promise.all([
      saveItem('experience', null, experience()),
      deleteItem('experience', 'x'),
      duplicateItem('experience', 'x'),
      reorderItems('experience', ['a']),
      setItemStatus('experience', 'x', 'DRAFT'),
      setItemFeatured('experience', 'x', true),
    ])
    for (const result of results) expect(result).toEqual({ ok: false, error: 'unauthorized' })
    expect(await db.experience.count()).toBe(0)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('does not swallow unexpected errors from the session check', async () => {
    assertAdmin.mockRejectedValue(new Error('auth backend down'))
    await expect(saveItem('experience', null, experience())).rejects.toThrow('auth backend down')
  })
})

describe('saveItem', () => {
  it('creates an item with a generated slug and the next position, then revalidates', async () => {
    const first = await saveItem('experience', null, experience())
    const second = await saveItem('experience', null, experience())
    expect(first.ok && second.ok).toBe(true)

    const rows = await db.experience.findMany({ orderBy: { position: 'asc' } })
    expect(rows.map((r) => r.slug)).toEqual(['jevis', 'jevis-2'])
    expect(rows.map((r) => r.position)).toEqual([0, 1])
    expect(rows[0]?.role).toEqual({ it: 'Responsabile IT', en: 'IT Head' })
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('updates in place and drops blank translations', async () => {
    const created = await saveItem('experience', null, experience())
    if (!created.ok) throw new Error('create failed')
    const updated = await saveItem('experience', created.data.id, experience({ role: { it: 'Capo IT', en: '   ' } }))
    expect(updated.ok).toBe(true)
    const row = await db.experience.findUniqueOrThrow({ where: { id: created.data.id } })
    expect(row.role).toEqual({ it: 'Capo IT' })
    expect(row.slug).toBe('jevis') // slug is stable across edits
  })

  it('returns field errors and writes nothing for invalid input', async () => {
    const result = await saveItem('experience', null, experience({ role: { en: 'only english' }, startDate: 'nope' }))
    expect(result).toMatchObject({ ok: false, error: 'validation' })
    expect(Object.keys((result as { fieldErrors: object }).fieldErrors).sort()).toEqual(['role', 'startDate'])
    expect(await db.experience.count()).toBe(0)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('does not let a payload set columns outside the definition', async () => {
    await saveItem('experience', null, experience({ id: 'attacker-id', position: 99, slug: 'hijack', status: 'PUBLISHED' }))
    const row = await db.experience.findFirstOrThrow()
    expect(row.id).not.toBe('attacker-id')
    expect(row.position).toBe(0)
    expect(row.slug).toBe('jevis')
  })

  it('answers notFound for unknown resources, missing rows and upload-only resources', async () => {
    expect(await saveItem('users', null, {})).toEqual({ ok: false, error: 'notFound' })
    expect(await saveItem('experience', 'missing-id', experience())).toEqual({ ok: false, error: 'notFound' })
    expect(await saveItem('photos', null, {})).toEqual({ ok: false, error: 'notFound' })
  })

  it('keeps an unrated skill unrated and resolves its category', async () => {
    const category = await db.skillCategory.create({ data: { slug: 'langs', name: { en: 'Languages' } } })
    const result = await saveItem('skills', null, { name: 'Java', categoryId: category.id, level: '' })
    expect(result.ok).toBe(true)
    expect((await db.skill.findFirstOrThrow()).level).toBeNull()
  })
})

describe('reorderItems', () => {
  it('persists the new order with dense positions', async () => {
    const ids: string[] = []
    for (const organization of ['A', 'B', 'C']) {
      const r = await saveItem('experience', null, experience({ organization }))
      if (r.ok) ids.push(r.data.id)
    }
    const [a, b, c] = ids as [string, string, string]
    expect(await reorderItems('experience', [c, a, b])).toEqual({ ok: true, data: undefined })
    const rows = await db.experience.findMany({ orderBy: { position: 'asc' } })
    expect(rows.map((r) => r.id)).toEqual([c, a, b])
    expect(rows.map((r) => r.position)).toEqual([0, 1, 2])
  })

  it('rejects malformed or duplicated id lists', async () => {
    expect(await reorderItems('experience', 'nope')).toMatchObject({ ok: false, error: 'validation' })
    expect(await reorderItems('experience', ['a', 'a'])).toMatchObject({ ok: false, error: 'validation' })
    expect(await reorderItems('experience', [1, 2])).toMatchObject({ ok: false, error: 'validation' })
    expect(await reorderItems('experience', Array.from({ length: 501 }, (_, i) => String(i)))).toMatchObject({
      ok: false,
      error: 'validation',
    })
  })

  it('is atomic: an unknown id rolls the whole reorder back', async () => {
    const a = await saveItem('experience', null, experience({ organization: 'A' }))
    const b = await saveItem('experience', null, experience({ organization: 'B' }))
    if (!a.ok || !b.ok) throw new Error('setup failed')
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await reorderItems('experience', [b.data.id, 'does-not-exist', a.data.id])
    error.mockRestore()
    expect(result.ok).toBe(false)
    const rows = await db.experience.findMany({ orderBy: { createdAt: 'asc' } })
    expect(rows.map((r) => r.position)).toEqual([0, 1])
  })
})

describe('status, featured, duplicate and delete', () => {
  it('toggles publication and the featured flag', async () => {
    const created = await saveItem('experience', null, experience())
    if (!created.ok) throw new Error('create failed')
    expect(await setItemStatus('experience', created.data.id, 'DRAFT')).toEqual({ ok: true, data: undefined })
    expect((await db.experience.findFirstOrThrow()).status).toBe('DRAFT')
    expect(await setItemStatus('experience', created.data.id, 'HIDDEN')).toMatchObject({ error: 'validation' })
    expect(await setItemFeatured('experience', created.data.id, false)).toEqual({ ok: true, data: undefined })
    expect(await setItemFeatured('experience', created.data.id, 'yes')).toMatchObject({ error: 'validation' })
    expect(await setItemFeatured('skills', 'x', true)).toMatchObject({ error: 'notFound' }) // no featured flag
  })

  it('duplicates as an unpublished copy at the end with its own slug', async () => {
    const created = await saveItem('experience', null, experience())
    if (!created.ok) throw new Error('create failed')
    const copy = await duplicateItem('experience', created.data.id)
    expect(copy.ok).toBe(true)
    const rows = await db.experience.findMany({ orderBy: { position: 'asc' } })
    expect(rows).toHaveLength(2)
    expect(rows[1]).toMatchObject({ slug: 'jevis-copy', status: 'DRAFT', featured: false, position: 1 })
    expect(rows[1]?.id).not.toBe(rows[0]?.id)
  })

  it('does not duplicate photos (they own a storage object)', async () => {
    const photo = await db.photo.create({ data: { key: 'portfolio/a.jpg' } })
    expect(await duplicateItem('photos', photo.id)).toEqual({ ok: false, error: 'notFound' })
    expect(await db.photo.count()).toBe(1)
  })

  it('deletes one item, and cascades skills with their category', async () => {
    const category = await db.skillCategory.create({ data: { slug: 'c', name: { en: 'C' } } })
    await db.skill.create({ data: { slug: 's', name: 'Java', categoryId: category.id } })
    expect(await deleteItem('skill-categories', category.id)).toEqual({ ok: true, data: undefined })
    expect(await db.skill.count()).toBe(0)
    expect(await deleteItem('skill-categories', category.id)).toEqual({ ok: false, error: 'notFound' })
  })

  it('keeps photos when their album is deleted', async () => {
    const album = await db.album.create({ data: { slug: 'a', title: { en: 'A' } } })
    await db.photo.create({ data: { key: 'portfolio/a/1.jpg', albumId: album.id } })
    await deleteItem('albums', album.id)
    const photo = await db.photo.findFirstOrThrow()
    expect(photo.albumId).toBeNull()
  })
})
