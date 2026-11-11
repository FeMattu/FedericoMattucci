import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { civil, db, resetDatabase } from './helpers'

import { getFormData, getListItems, getLocaleOptions, getSelectOptions } from '@/lib/admin/queries'

beforeEach(resetDatabase)
afterAll(() => db.$disconnect())

describe('getLocaleOptions', () => {
  it('puts the default language first and hides disabled ones', async () => {
    await db.locale.create({ data: { code: 'fr', name: 'Français', position: 2 } })
    await db.locale.create({ data: { code: 'de', name: 'Deutsch', position: 3, enabled: false } })
    expect(await getLocaleOptions()).toEqual([
      { code: 'it', name: 'Italiano', isDefault: true },
      { code: 'en', name: 'English', isDefault: false },
      { code: 'fr', name: 'Français', isDefault: false },
    ])
  })
})

describe('getListItems', () => {
  it('maps rows to list items with localized titles, subtitles, status and featured', async () => {
    await db.experience.create({
      data: {
        slug: 'jevis',
        organization: 'JEVIS',
        role: { en: 'Head' },
        summary: { it: 'x' },
        startDate: civil(2025, 1),
        featured: true,
        status: 'DRAFT',
      },
    })
    const [item] = await getListItems('experience')
    expect(item).toMatchObject({ title: 'Head', subtitle: 'JEVIS', status: 'DRAFT', featured: true })
  })

  it('orders by position and shows (untitled) when there is no text', async () => {
    await db.certification.create({ data: { slug: 'b', name: { it: 'Secondo' }, position: 1 } })
    await db.certification.create({ data: { slug: 'a', name: { it: 'Primo' }, position: 0 } })
    await db.certification.create({ data: { slug: 'c', name: {}, position: 2 } })
    expect((await getListItems('certifications')).map((i) => i.title)).toEqual(['Primo', 'Secondo', '(untitled)'])
  })

  it('leaves out status and featured for resources without them', async () => {
    await db.socialLink.create({ data: { kind: 'github', label: 'GitHub', url: 'https://github.com/x' } })
    const [item] = await getListItems('social-links')
    expect(item).toMatchObject({ title: 'GitHub', subtitle: 'https://github.com/x' })
    expect(item?.featured).toBeUndefined()
  })

  it('gives photos a signed thumbnail and the file name as title when untitled', async () => {
    await db.photo.create({ data: { key: 'portfolio/street/DSC0001.jpg', position: 0 } })
    await db.photo.create({ data: { key: 'portfolio/b.jpg', title: { it: 'Titolo' }, position: 1 } })
    const items = await getListItems('photos')
    expect(items.map((i) => i.title)).toEqual(['DSC0001.jpg', 'Titolo'])
    expect(items[0]?.thumbUrl).toMatch(/^https:\/\/cdn\.test\.example\/portfolio\/street\/DSC0001\.jpg\?/)
  })
})

describe('getSelectOptions', () => {
  it('offers categories and albums by their default-language name', async () => {
    const category = await db.skillCategory.create({ data: { slug: 'c', name: { it: 'Linguaggi' } } })
    const album = await db.album.create({ data: { slug: 'a', title: { it: 'Ritratti' } } })
    expect(await getSelectOptions()).toEqual({
      categories: [{ value: category.id, label: 'Linguaggi' }],
      albums: [{ value: album.id, label: 'Ritratti' }],
    })
  })
})

describe('getFormData', () => {
  it('returns a blank, published form for a new item', async () => {
    const data = await getFormData('projects', null)
    expect(data?.initial).toMatchObject({ status: 'PUBLISHED', featured: false, tags: [], title: {} })
    expect(data?.row).toBeNull()
    expect(data?.locales.map((l) => l.code)).toEqual(['it', 'en'])
  })

  it('returns null for an id that does not exist', async () => {
    expect(await getFormData('projects', 'missing')).toBeNull()
  })

  it('loads an existing item as form values, with a signed preview for image fields', async () => {
    const project = await db.project.create({
      data: {
        slug: 'site',
        title: { it: 'Sito' },
        summary: { it: 'Riassunto' },
        tags: ['React'],
        coverKey: 'projects/1-a-cover.png',
        startDate: civil(2026, 3, 15),
      },
    })
    const data = await getFormData('projects', project.id)
    expect(data?.initial).toMatchObject({
      title: { it: 'Sito' },
      tags: ['React'],
      coverKey: 'projects/1-a-cover.png',
      startDate: '2026-03-15',
      liveUrl: '',
    })
    expect(data?.previews.coverKey).toMatch(/^https:\/\/cdn\.test\.example\/projects\/1-a-cover\.png\?/)
  })

  it('previews the picture itself for a photo', async () => {
    const photo = await db.photo.create({ data: { key: 'portfolio/a.jpg' } })
    const data = await getFormData('photos', photo.id)
    expect(data?.previews.photo).toContain('cdn.test.example/portfolio/a.jpg')
  })
})
