import 'server-only'
import type { LocaleOption } from '@/components/admin/fields'
import type { ListItem } from '@/components/admin/sortable-list'
import { RESOURCES, type ResourceKey } from '@/lib/admin/resources'
import { rowTitle, toFormValues } from '@/lib/admin/schema'
import { adminRepository as repo, type AdminRow } from '@/lib/db/repositories/admin'
import { localize } from '@/lib/i18n/localized'
import { cdnUrls } from '@/lib/storage/cdn'

/** Enabled languages, default first: the order of the translation tabs. */
export async function getLocaleOptions(): Promise<LocaleOption[]> {
  const rows = await repo.locales()
  return rows
    .filter((l) => l.enabled || l.isDefault)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.position - b.position)
    .map((l) => ({ code: l.code, name: l.name, isDefault: l.isDefault }))
}

function subtitle(key: ResourceKey, row: AdminRow, locale: string): string | undefined {
  const field = RESOURCES[key].subtitleField
  if (!field) return undefined
  const text = localize(row[field], locale)
  return text || undefined
}

/** Rows as serializable list items. Photos get a signed thumbnail. */
export async function getListItems(key: ResourceKey): Promise<ListItem[]> {
  const [rows, locale] = await Promise.all([repo.list(key), repo.defaultLocale()])
  const def = RESOURCES[key]
  const thumbs = key === 'photos' ? cdnUrls(rows.map((r) => String(r.key))) : {}

  return rows.map((row) => ({
    id: row.id,
    title:
      key === 'photos'
        ? rowTitle(def, row, locale) === '(untitled)'
          ? String(row.key).split('/').pop() || 'Photo'
          : rowTitle(def, row, locale)
        : rowTitle(def, row, locale),
    subtitle: subtitle(key, row, locale),
    status: def.hasStatus ? (row.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED') : undefined,
    featured: def.hasFeatured ? row.featured === true : undefined,
    thumbUrl: key === 'photos' ? thumbs[String(row.key)] : undefined,
  }))
}

/** Select options used by form fields (`optionsKey`). */
export async function getSelectOptions(): Promise<Record<string, { value: string; label: string }[]>> {
  const [categories, albums, locale] = await Promise.all([
    repo.list('skill-categories'),
    repo.list('albums'),
    repo.defaultLocale(),
  ])
  const label = (row: AdminRow, field: string) => localize(row[field], locale) || String(row.slug ?? row.id)
  return {
    categories: categories.map((c) => ({ value: c.id, label: label(c, 'name') })),
    albums: albums.map((a) => ({ value: a.id, label: label(a, 'title') })),
  }
}

/** Everything the edit form needs for one item (or a blank form when `id` is null). */
export async function getFormData(key: ResourceKey, id: string | null) {
  const def = RESOURCES[key]
  const [row, locales, options] = await Promise.all([
    id ? repo.get(key, id) : Promise.resolve(null),
    getLocaleOptions(),
    getSelectOptions(),
  ])
  if (id && !row) return null

  const initial = row ? toFormValues(def, row) : toFormValues(def, { status: 'PUBLISHED' })
  const previews: Record<string, string> = {}
  const imageKeys = def.fields.filter((f) => f.type === 'image').map((f) => [f.name, initial[f.name]] as const)
  const urls = cdnUrls(imageKeys.map(([, v]) => (typeof v === 'string' ? v : null)))
  for (const [name, v] of imageKeys) if (typeof v === 'string' && urls[v]) previews[name] = urls[v]
  // Photos show the picture itself above the form.
  if (key === 'photos' && row) {
    const photoUrls = cdnUrls([String(row.key)])
    previews.photo = photoUrls[String(row.key)] ?? ''
  }
  return { def, initial, locales, options, previews, row }
}
