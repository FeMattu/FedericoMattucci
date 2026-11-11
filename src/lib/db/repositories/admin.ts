import 'server-only'
import type { PrismaClient } from '@prisma/client'
import { defaultLocale as configDefaultLocale } from '@/i18n/config'
import { RESOURCES, type ResourceDef, type ResourceKey } from '@/lib/admin/resources'
import { prisma } from '@/lib/db/prisma'
import { localize } from '@/lib/i18n/localized'
import { slugify } from '@/lib/slug'

export type AdminRow = Record<string, unknown> & { id: string }
type Status = 'DRAFT' | 'PUBLISHED'

/**
 * Every content model has the same CRUD surface; this is the one narrow,
 * documented cast that lets the generic admin treat them uniformly. Inputs
 * are never user-shaped: writes only receive `toPrismaData` output (declared
 * fields only), and `where` clauses are built here.
 */
type Delegate = {
  findMany(args?: { where?: object; orderBy?: object | object[]; take?: number; select?: object }): Promise<AdminRow[]>
  findUnique(args: { where: { id: string } }): Promise<AdminRow | null>
  create(args: { data: Record<string, unknown> }): Promise<AdminRow>
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<AdminRow>
  delete(args: { where: { id: string } }): Promise<unknown>
  count(args?: { where?: object }): Promise<number>
}

/** Works with the global client and with a transaction client (`tx`). */
type Client = Pick<
  PrismaClient,
  'experience' | 'education' | 'certification' | 'skillCategory' | 'skill' | 'project' | 'socialLink' | 'album' | 'photo'
>

function buildDelegates(client: Client): Record<ResourceKey, Delegate> {
  return {
    experience: client.experience as unknown as Delegate,
    education: client.education as unknown as Delegate,
    certifications: client.certification as unknown as Delegate,
    'skill-categories': client.skillCategory as unknown as Delegate,
    skills: client.skill as unknown as Delegate,
    projects: client.project as unknown as Delegate,
    'social-links': client.socialLink as unknown as Delegate,
    albums: client.album as unknown as Delegate,
    photos: client.photo as unknown as Delegate,
  }
}

const delegates = buildDelegates(prisma)

/** Resources whose table has a unique `slug` column. */
const HAS_SLUG: ReadonlySet<ResourceKey> = new Set([
  'experience',
  'education',
  'certifications',
  'skill-categories',
  'skills',
  'projects',
  'albums',
])

const ORDER = [{ position: 'asc' }, { createdAt: 'asc' }]

async function defaultLocale(): Promise<string> {
  const row = await prisma.locale.findFirst({ where: { isDefault: true } })
  return row?.code ?? configDefaultLocale
}

function slugBase(def: ResourceDef, data: Record<string, unknown>, locale: string): string {
  const field = def.slugFrom ?? def.titleField
  const text = localize(data[field], locale)
  return slugify(text) || slugify(def.singular) || 'item'
}

/** `base`, `base-2`, `base-3`… first one not used yet. */
async function uniqueSlug(delegate: Delegate, base: string): Promise<string> {
  const taken = new Set(
    (await delegate.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map((r) => String(r.slug)),
  )
  if (!taken.has(base)) return base
  for (let n = 2; ; n += 1) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`
}

async function nextPosition(delegate: Delegate): Promise<number> {
  const [last] = await delegate.findMany({ orderBy: { position: 'desc' }, take: 1, select: { position: true } })
  return typeof last?.position === 'number' ? last.position + 1 : 0
}

export const adminRepository = {
  defaultLocale,

  locales: () => prisma.locale.findMany({ orderBy: { position: 'asc' } }),

  list: (key: ResourceKey) => delegates[key].findMany({ orderBy: ORDER }),

  get: (key: ResourceKey, id: string) => delegates[key].findUnique({ where: { id } }),

  count: (key: ResourceKey) => delegates[key].count(),

  async create(key: ResourceKey, data: Record<string, unknown>): Promise<AdminRow> {
    const delegate = delegates[key]
    const def = RESOURCES[key]
    const extra: Record<string, unknown> = { position: await nextPosition(delegate) }
    if (HAS_SLUG.has(key)) extra.slug = await uniqueSlug(delegate, slugBase(def, data, await defaultLocale()))
    return delegate.create({ data: { ...data, ...extra } })
  },

  update: (key: ResourceKey, id: string, data: Record<string, unknown>) =>
    delegates[key].update({ where: { id }, data }),

  remove: (key: ResourceKey, id: string) => delegates[key].delete({ where: { id } }),

  /** Dense positions in the order given. Ids not listed keep their position. */
  async reorder(key: ResourceKey, ids: readonly string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const delegate = buildDelegates(tx)[key]
      for (const [position, id] of ids.entries()) {
        await delegate.update({ where: { id }, data: { position } })
      }
    })
  },

  /** Copy as a draft at the end of the list, with a fresh slug. */
  async duplicate(key: ResourceKey, id: string): Promise<AdminRow | null> {
    const delegate = delegates[key]
    const source = await delegate.findUnique({ where: { id } })
    if (!source) return null

    const data: Record<string, unknown> = { ...source }
    for (const field of ['id', 'createdAt', 'updatedAt']) delete data[field]
    data.position = await nextPosition(delegate)
    if (RESOURCES[key].hasStatus) data.status = 'DRAFT'
    if ('featured' in data) data.featured = false
    if (key === 'photos') return null // photos are bound to a storage object: duplicating would share it
    if (HAS_SLUG.has(key)) data.slug = await uniqueSlug(delegate, `${String(source.slug)}-copy`)
    return delegate.create({ data })
  },

  setStatus: (key: ResourceKey, id: string, status: Status) => delegates[key].update({ where: { id }, data: { status } }),

  setFeatured: (key: ResourceKey, id: string, featured: boolean) =>
    delegates[key].update({ where: { id }, data: { featured } }),
}

export type AdminRepository = typeof adminRepository
