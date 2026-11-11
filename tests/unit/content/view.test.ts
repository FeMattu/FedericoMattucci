import { describe, expect, it } from 'vitest'
import {
  collectTags,
  toEducationView,
  toExperienceView,
  toProjectView,
  toSiteTexts,
  toSkillCategoryView,
} from '@/lib/content/view'

const labels = { present: 'Present' }

const experience = {
  id: '1',
  slug: 'jevis',
  organization: 'JEVIS',
  role: { it: 'Responsabile IT', en: 'IT Head' },
  location: 'Pisa',
  summary: { it: 'Riassunto', en: 'Summary' },
  description: null,
  highlights: { it: ['uno'], en: ['one'] },
  startDate: new Date(Date.UTC(2026, 1, 1)),
  endDate: null,
  url: null,
  tags: ['Agile'],
  featured: true,
}

describe('toExperienceView', () => {
  it('localizes text and marks an open-ended role as current', () => {
    const view = toExperienceView(experience, 'en', labels)
    expect(view).toMatchObject({
      role: 'IT Head',
      summary: 'Summary',
      highlights: ['one'],
      period: 'Feb 2026 – Present',
      isCurrent: true,
      description: '',
    })
  })

  it('falls back to the default locale for a language without translations', () => {
    const view = toExperienceView(experience, 'fr', labels)
    expect(view.role).toBe('Responsabile IT')
    expect(view.highlights).toEqual(['uno'])
  })

  it('formats a closed period and is not current', () => {
    const view = toExperienceView({ ...experience, endDate: new Date(Date.UTC(2026, 8, 1)) }, 'en', labels)
    expect(view.period).toBe('Feb 2026 – Sep 2026')
    expect(view.isCurrent).toBe(false)
  })
})

describe('toEducationView', () => {
  it('tolerates missing optional translations', () => {
    const view = toEducationView(
      {
        id: '1',
        slug: 'fermi',
        institution: 'Fermi',
        title: { it: 'Diploma' },
        location: null,
        summary: null,
        description: null,
        highlights: null,
        startDate: new Date(Date.UTC(2018, 8, 1)),
        endDate: new Date(Date.UTC(2023, 6, 1)),
        url: null,
      },
      'en',
      labels,
    )
    expect(view.title).toBe('Diploma')
    expect(view.summary).toBe('')
    expect(view.highlights).toEqual([])
  })
})

describe('toSkillCategoryView', () => {
  it('keeps unrated skills unrated (level stays null)', () => {
    const view = toSkillCategoryView(
      {
        id: 'c',
        slug: 'langs',
        name: { en: 'Languages' },
        skills: [{ id: 's', slug: 'java', name: 'Java', level: null, years: null, description: null }],
      },
      'en',
    )
    expect(view.name).toBe('Languages')
    expect(view.skills[0]).toMatchObject({ name: 'Java', level: null, description: '' })
  })
})

describe('projects and tags', () => {
  const project = {
    id: 'p',
    slug: 'site',
    title: { en: 'Site' },
    summary: {},
    description: null,
    coverKey: null,
    gallery: [],
    tags: ['React', 'Next.js'],
    liveUrl: null,
    repoUrl: null,
    featured: false,
  }

  it('maps a project with an empty summary', () => {
    expect(toProjectView(project, 'en')).toMatchObject({ title: 'Site', summary: '' })
  })

  it('collects distinct sorted tags', () => {
    expect(collectTags([project, { tags: ['React', 'Angular'] }])).toEqual(['Angular', 'Next.js', 'React'])
  })
})

describe('toSiteTexts', () => {
  it('resolves each key for the locale', () => {
    expect(toSiteTexts([{ key: 'hero.role', value: { it: 'Dev', en: 'Developer' } }], 'en')).toEqual({
      'hero.role': 'Developer',
    })
  })
})
