import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { civil, db, resetDatabase } from './helpers'

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}))

import { getEducation, getExperience, getHomeContent, getNavSections, getProject, listSlugs } from '@/lib/content'
import { getPhotosContent, hasPhotos } from '@/lib/content/photos'

beforeEach(resetDatabase)
afterAll(() => db.$disconnect())

const experience = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug,
  organization: slug.toUpperCase(),
  role: { it: `Ruolo ${slug}`, en: `Role ${slug}` },
  summary: { it: 'Riassunto' },
  startDate: civil(2024, 6),
  ...extra,
})

async function seedBasics() {
  await db.experience.create({ data: experience('old', { startDate: civil(2020, 1), endDate: civil(2021, 1) }) })
  await db.experience.create({ data: experience('current', { startDate: civil(2025, 4), position: 1 }) })
  await db.experience.create({ data: experience('draft', { status: 'DRAFT' }) })
  await db.education.create({
    data: { slug: 'unipi', institution: 'UniPi', title: { it: 'Laurea' }, startDate: civil(2023, 9) },
  })
  await db.education.create({
    data: { slug: 'hidden-edu', institution: 'X', title: { it: 'X' }, startDate: civil(2000, 1), status: 'DRAFT' },
  })
  await db.certification.create({ data: { slug: 'ielts', name: { it: 'IELTS', en: 'IELTS 6.5' } } })
  const category = await db.skillCategory.create({ data: { slug: 'langs', name: { it: 'Linguaggi', en: 'Languages' } } })
  await db.skill.create({ data: { slug: 'java', name: 'Java', level: 4, categoryId: category.id, position: 1 } })
  await db.skill.create({ data: { slug: 'ts', name: 'TypeScript', categoryId: category.id, position: 0 } })
  await db.skill.create({ data: { slug: 'cobol', name: 'COBOL', categoryId: category.id, status: 'DRAFT' } })
  await db.socialLink.create({ data: { kind: 'github', label: 'GitHub', url: 'https://github.com/x' } })
  await db.socialLink.create({ data: { kind: 'old', url: 'https://old.example', status: 'DRAFT' } })
  await db.siteText.create({ data: { key: 'hero.role', value: { it: 'Sviluppatore', en: 'Developer' } } })
}

describe('getHomeContent', () => {
  it('returns only published content, newest first, localized with fallback', async () => {
    await seedBasics()
    const it = await getHomeContent('it')
    expect(it.experiences.map((e) => e.slug)).toEqual(['current', 'old'])
    expect(it.experiences[0]).toMatchObject({ role: 'Ruolo current', isCurrent: true, period: expect.stringContaining('present') })
    expect(it.education.map((e) => e.slug)).toEqual(['unipi'])
    expect(it.texts['hero.role']).toBe('Sviluppatore')

    const en = await getHomeContent('en')
    expect(en.experiences[0]?.role).toBe('Role current')
    expect(en.experiences[0]?.summary).toBe('Riassunto') // falls back to the default language
    expect(en.certifications[0]?.name).toBe('IELTS 6.5')
    expect(en.texts['hero.role']).toBe('Developer')
  })

  it('orders skills by position inside published categories and hides drafts', async () => {
    await seedBasics()
    const { skillCategories } = await getHomeContent('en')
    expect(skillCategories).toHaveLength(1)
    expect(skillCategories[0]?.name).toBe('Languages')
    expect(skillCategories[0]?.skills.map((s) => s.name)).toEqual(['TypeScript', 'Java'])
    expect(skillCategories[0]?.skills[0]?.level).toBeNull() // never invented
  })

  it('lists published social links and collects distinct project tags', async () => {
    await seedBasics()
    await db.project.createMany({
      data: [
        { slug: 'a', title: { it: 'A' }, summary: {}, tags: ['React', 'Next.js'] },
        { slug: 'b', title: { it: 'B' }, summary: {}, tags: ['React'], position: 1 },
        { slug: 'c', title: { it: 'C' }, summary: {}, tags: ['Secret'], status: 'DRAFT' },
      ],
    })
    const content = await getHomeContent('it')
    expect(content.socials).toEqual([expect.objectContaining({ kind: 'github', label: 'GitHub' })])
    expect(content.projects.map((p) => p.slug)).toEqual(['a', 'b'])
    expect(content.projectTags).toEqual(['Next.js', 'React'])
  })

  it('is empty, not broken, on an empty database', async () => {
    const content = await getHomeContent('it')
    expect(content).toMatchObject({ experiences: [], education: [], skillCategories: [], projects: [], socials: [], texts: {} })
  })
})

describe('detail lookups', () => {
  it('finds published items by slug and hides drafts and unknown slugs', async () => {
    await seedBasics()
    await db.project.create({ data: { slug: 'site', title: { it: 'Sito' }, summary: {} } })
    await db.project.create({ data: { slug: 'wip', title: { it: 'WIP' }, summary: {}, status: 'DRAFT' } })

    expect((await getExperience('en', 'current'))?.role).toBe('Role current')
    expect(await getExperience('en', 'draft')).toBeNull()
    expect(await getExperience('en', 'nope')).toBeNull()
    expect((await getEducation('it', 'unipi'))?.institution).toBe('UniPi')
    expect(await getEducation('it', 'hidden-edu')).toBeNull()
    expect((await getProject('it', 'site'))?.title).toBe('Sito')
    expect(await getProject('it', 'wip')).toBeNull()
  })

  it('lists the slugs of published items for static generation and the sitemap', async () => {
    await seedBasics()
    await db.project.create({ data: { slug: 'site', title: { it: 'Sito' }, summary: {} } })
    const slugs = await listSlugs()
    expect(slugs.experiences.sort()).toEqual(['current', 'old'])
    expect(slugs.education).toEqual(['unipi'])
    expect(slugs.projects).toEqual(['site'])
  })
})

describe('getNavSections', () => {
  it('hides projects and photos while there is nothing to show', async () => {
    const sections = await getNavSections()
    expect(sections).not.toContain('projects')
    expect(sections).not.toContain('photos')
    expect(sections).toEqual(expect.arrayContaining(['experience', 'education', 'skills', 'contact']))
  })

  it('shows them once there is published content', async () => {
    await db.project.create({ data: { slug: 'site', title: { it: 'Sito' }, summary: {} } })
    await db.photo.create({ data: { key: 'portfolio/a.jpg' } })
    const sections = await getNavSections()
    expect(sections).toEqual(expect.arrayContaining(['projects', 'photos']))
  })
})

describe('getPhotosContent', () => {
  it('signs URLs, counts albums, collects tags and hides drafts and hidden albums', async () => {
    const shown = await db.album.create({ data: { slug: 'portrait', title: { it: 'Ritratti', en: 'Portraits' } } })
    const hidden = await db.album.create({ data: { slug: 'private', title: { it: 'Privato' }, status: 'DRAFT' } })
    await db.photo.createMany({
      data: [
        { key: 'portfolio/portrait/a.jpg', albumId: shown.id, tags: ['b&w', 'studio'], position: 0, width: 4000, height: 3000 },
        { key: 'portfolio/portrait/b.jpg', albumId: shown.id, tags: ['studio'], position: 1, title: { en: 'Second' } },
        { key: 'portfolio/loose.jpg', position: 2 },
        { key: 'portfolio/draft.jpg', status: 'DRAFT', position: 3 },
        { key: 'portfolio/private/x.jpg', albumId: hidden.id, position: 4 },
      ],
    })

    const content = await getPhotosContent('en')
    expect(content.photos).toHaveLength(3)
    expect(content.photos.map((p) => p.url).every((u) => u.startsWith('https://cdn.test.example/portfolio/'))).toBe(true)
    expect(content.photos[0]).toMatchObject({ width: 4000, height: 3000 })
    expect(content.photos[1]).toMatchObject({ title: 'Second', alt: 'Second' })
    expect(content.photos[2]?.alt).toBe('photoAlt') // fallback text
    expect(content.albums).toEqual([{ id: shown.id, slug: 'portrait', title: 'Portraits', count: 2 }])
    expect(content.tags).toEqual(['b&w', 'studio'])
  })

  it('reports whether there are any photos', async () => {
    expect(await hasPhotos()).toBe(false)
    await db.photo.create({ data: { key: 'portfolio/a.jpg' } })
    expect(await hasPhotos()).toBe(true)
  })
})
