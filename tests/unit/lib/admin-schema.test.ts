import { describe, expect, it } from 'vitest'
import { RESOURCES, RESOURCE_KEYS, isResourceKey, localizedFields } from '@/lib/admin/resources'
import {
  buildSchema,
  cleanLocalized,
  cleanLocalizedList,
  parseCivilDate,
  rowTitle,
  toFormValues,
  toPrismaData,
} from '@/lib/admin/schema'

const experienceInput = {
  organization: 'JEVIS',
  role: { it: 'Responsabile IT', en: '' },
  location: '',
  startDate: '2026-02-01',
  endDate: '',
  summary: { it: 'Riassunto' },
  description: {},
  highlights: { it: ['uno', '  ', 'due'] },
  tags: ['Agile'],
  url: '',
}

describe('resource definitions', () => {
  it('describes every key and recognises them', () => {
    for (const key of RESOURCE_KEYS) {
      expect(RESOURCES[key].key).toBe(key)
      expect(isResourceKey(key)).toBe(true)
    }
    expect(isResourceKey('users')).toBe(false)
    expect(isResourceKey('__proto__')).toBe(false)
  })

  it('lists the translatable fields', () => {
    expect(localizedFields(RESOURCES.experience).map((f) => f.name)).toEqual([
      'role',
      'summary',
      'description',
      'highlights',
    ])
  })
})

describe('buildSchema', () => {
  const schema = buildSchema(RESOURCES.experience, 'it')

  it('accepts a valid payload and applies defaults', () => {
    const parsed = schema.parse(experienceInput)
    expect(parsed).toMatchObject({ organization: 'JEVIS', startDate: '2026-02-01' })
  })

  it('requires the default-locale text of required translatable fields', () => {
    const result = schema.safeParse({ ...experienceInput, role: { en: 'Head' } })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('requiredDefaultLocale')
  })

  it('rejects missing required fields and malformed dates and URLs', () => {
    expect(schema.safeParse({ ...experienceInput, organization: ' ' }).success).toBe(false)
    expect(schema.safeParse({ ...experienceInput, startDate: '11/02/2026' }).success).toBe(false)
    expect(schema.safeParse({ ...experienceInput, url: 'javascript:alert(1)' }).success).toBe(false)
    expect(schema.safeParse({ ...experienceInput, url: 'https://example.com/x' }).success).toBe(true)
  })

  it('allows mailto: and tel: links for social links but not other schemes', () => {
    const social = buildSchema(RESOURCES['social-links'], 'it')
    const base = { kind: 'email', label: '' }
    expect(social.safeParse({ ...base, url: 'mailto:me@example.com' }).success).toBe(true)
    expect(social.safeParse({ ...base, url: 'tel:+390000' }).success).toBe(true)
    expect(social.safeParse({ ...base, url: 'data:text/html,x' }).success).toBe(false)
    expect(social.safeParse({ ...base, url: '' }).success).toBe(false)
  })

  it('validates numbers against the field range', () => {
    const skills = buildSchema(RESOURCES.skills, 'it')
    const base = { name: 'Java', categoryId: 'c1' }
    expect(skills.safeParse({ ...base, level: 5 }).success).toBe(true)
    expect(skills.safeParse({ ...base, level: '' }).success).toBe(true)
    expect(skills.safeParse({ ...base, level: 6 }).success).toBe(false)
    expect(skills.safeParse({ ...base, level: 2.5 }).success).toBe(false)
  })

  it('rejects storage keys that could escape the bucket prefix', () => {
    const projects = buildSchema(RESOURCES.projects, 'it')
    const base = { title: { it: 'Sito' } }
    expect(projects.safeParse({ ...base, coverKey: 'projects/a.jpg' }).success).toBe(true)
    expect(projects.safeParse({ ...base, coverKey: '../secret' }).success).toBe(false)
    expect(projects.safeParse({ ...base, coverKey: 'https://evil.com/x.jpg' }).success).toBe(false)
  })

  it('does not accept arbitrary status values', () => {
    expect(schema.safeParse({ ...experienceInput, status: 'DELETED' }).success).toBe(false)
    expect(schema.safeParse({ ...experienceInput, status: 'DRAFT' }).success).toBe(true)
  })

  it('strips unknown keys so nothing outside the definition reaches the database', () => {
    const parsed = schema.parse({ ...experienceInput, id: 'x', position: 99, slug: 'hack' })
    expect(parsed).not.toHaveProperty('id')
    expect(parsed).not.toHaveProperty('position')
    expect(parsed).not.toHaveProperty('slug')
  })
})

describe('cleaning', () => {
  it('drops blank translations so the fallback keeps working', () => {
    expect(cleanLocalized({ it: ' Ciao ', en: '   ', fr: undefined })).toEqual({ it: 'Ciao' })
    expect(cleanLocalizedList({ it: ['a', ' ', 'b'], en: ['  '] })).toEqual({ it: ['a', 'b'] })
  })
})

describe('toPrismaData', () => {
  const schema = buildSchema(RESOURCES.experience, 'it')

  it('maps the payload to database values', () => {
    const data = toPrismaData(RESOURCES.experience, schema.parse(experienceInput))
    expect(data).toMatchObject({
      organization: 'JEVIS',
      role: { it: 'Responsabile IT' },
      location: null,
      endDate: null,
      description: null,
      highlights: { it: ['uno', 'due'] },
      tags: ['Agile'],
    })
    expect((data.startDate as Date).toISOString()).toBe('2026-02-01T00:00:00.000Z')
  })

  it('keeps null for an unrated skill level', () => {
    const skills = buildSchema(RESOURCES.skills, 'it')
    const data = toPrismaData(RESOURCES.skills, skills.parse({ name: 'Java', categoryId: 'c', level: '' }))
    expect(data.level).toBeNull()
  })
})

describe('toFormValues and rowTitle', () => {
  it('round-trips dates and nulls', () => {
    const values = toFormValues(RESOURCES.experience, {
      organization: 'JEVIS',
      startDate: new Date(Date.UTC(2026, 1, 1)),
      endDate: null,
      role: { it: 'x' },
      tags: ['a'],
      status: 'PUBLISHED',
      featured: true,
    })
    expect(values).toMatchObject({ startDate: '2026-02-01', endDate: '', role: { it: 'x' }, status: 'PUBLISHED', featured: true })
    expect(parseCivilDate('2026-02-01').toISOString()).toBe('2026-02-01T00:00:00.000Z')
  })

  it('picks a readable title from plain or localized fields', () => {
    expect(rowTitle(RESOURCES.skills, { name: 'Java' }, 'it')).toBe('Java')
    expect(rowTitle(RESOURCES.experience, { role: { en: 'Head', it: 'Capo' } }, 'it')).toBe('Capo')
    expect(rowTitle(RESOURCES.experience, { role: { en: 'Head' } }, 'it')).toBe('Head')
    expect(rowTitle(RESOURCES.experience, { role: null }, 'it')).toBe('(untitled)')
  })
})
