import { z } from 'zod'
import { isSafeKey } from '@/lib/storage/signing'
import type { FieldDef, ResourceDef } from './resources'

/**
 * Builds the zod schema of a resource from its field definitions and turns
 * the parsed payload into Prisma data. The payload is plain JSON sent by the
 * admin form: dates as "YYYY-MM-DD", empty strings for "not set".
 */

const URL_PATTERN = /^(https?:\/\/|mailto:|tel:)\S+$/i
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function fieldSchema(field: FieldDef, defaultLocale: string): z.ZodType {
  const required = !!field.required
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'select': {
      const base = z.string().trim().max(5000)
      return required ? base.min(1, 'required') : base.optional().default('')
    }
    case 'url': {
      const base = z.string().trim().max(2000)
      const checked = base.refine((v) => v === '' || URL_PATTERN.test(v), 'invalidUrl')
      return required ? checked.refine((v) => v !== '', 'required') : checked.optional().default('')
    }
    case 'image': {
      const base = z.string().trim().refine((v) => v === '' || isSafeKey(v), 'invalidKey')
      return base.optional().default('')
    }
    case 'date': {
      const base = z.string().trim().refine((v) => v === '' || DATE_PATTERN.test(v), 'invalidDate')
      return required ? base.refine((v) => v !== '', 'required') : base.optional().default('')
    }
    case 'number': {
      const n = z.union([z.number(), z.literal(''), z.null()]).optional()
      return n.refine(
        (v) => v === undefined || v === null || v === '' || (Number.isInteger(v) && v >= (field.min ?? 0) && v <= (field.max ?? 1000)),
        'invalidNumber',
      )
    }
    case 'boolean':
      return z.boolean().optional().default(false)
    case 'tags':
      return z.array(z.string().trim().min(1).max(60)).max(30).optional().default([])
    case 'localized':
    case 'localizedArea': {
      const record = z.record(z.string().min(1).max(12), z.string().max(10000)).default({})
      return required
        ? record.refine((v) => (v[defaultLocale] ?? '').trim() !== '', 'requiredDefaultLocale')
        : record
    }
    case 'localizedList':
      return z.record(z.string().min(1).max(12), z.array(z.string().max(2000)).max(50)).optional().default({})
  }
}

export function buildSchema(def: ResourceDef, defaultLocale: string) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of def.fields) shape[field.name] = fieldSchema(field, defaultLocale)
  if (def.hasStatus) shape.status = z.enum(['DRAFT', 'PUBLISHED']).optional()
  if (def.hasFeatured) shape.featured = z.boolean().optional()
  return z.object(shape)
}

/** Drops blank translations so the default-locale fallback keeps working. */
export function cleanLocalized(value: Record<string, string | undefined> | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [code, text] of Object.entries(value ?? {})) {
    const trimmed = (text ?? '').trim()
    if (trimmed !== '') out[code] = trimmed
  }
  return out
}

export function cleanLocalizedList(value: Record<string, string[] | undefined> | undefined): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [code, lines] of Object.entries(value ?? {})) {
    const items = (lines ?? []).map((l) => l.trim()).filter(Boolean)
    if (items.length > 0) out[code] = items
  }
  return out
}

export function parseCivilDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d))
}

/** Parsed payload -> Prisma `data`. Empty optionals become null (or an empty value for required columns). */
export function toPrismaData(def: ResourceDef, parsed: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const field of def.fields) {
    const value = parsed[field.name]
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'url':
      case 'select':
      case 'image':
        data[field.name] = typeof value === 'string' && value !== '' ? value : field.required ? '' : null
        break
      case 'date':
        data[field.name] = typeof value === 'string' && value !== '' ? parseCivilDate(value) : null
        break
      case 'number':
        data[field.name] = typeof value === 'number' ? value : null
        break
      case 'boolean':
        data[field.name] = value === true
        break
      case 'tags':
        data[field.name] = Array.isArray(value) ? value : []
        break
      case 'localized':
      case 'localizedArea': {
        const cleaned = cleanLocalized(value as Record<string, string>)
        data[field.name] = field.required ? cleaned : Object.keys(cleaned).length > 0 ? cleaned : null
        break
      }
      case 'localizedList': {
        const cleaned = cleanLocalizedList(value as Record<string, string[]>)
        data[field.name] = Object.keys(cleaned).length > 0 ? cleaned : null
        break
      }
    }
  }
  if (def.hasStatus && parsed.status) data.status = parsed.status
  if (def.hasFeatured && typeof parsed.featured === 'boolean') data.featured = parsed.featured
  return data
}

/** Prisma row -> the plain JSON values the form edits (dates as "YYYY-MM-DD", null as ""). */
export function toFormValues(def: ResourceDef, row: Record<string, unknown>): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of def.fields) {
    const value = row[field.name]
    switch (field.type) {
      case 'date':
        values[field.name] = value instanceof Date ? value.toISOString().slice(0, 10) : ''
        break
      case 'number':
        values[field.name] = typeof value === 'number' ? value : ''
        break
      case 'boolean':
        values[field.name] = value === true
        break
      case 'tags':
        values[field.name] = Array.isArray(value) ? value : []
        break
      case 'localized':
      case 'localizedArea':
      case 'localizedList':
        values[field.name] = typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {}
        break
      default:
        values[field.name] = typeof value === 'string' ? value : ''
    }
  }
  if (def.hasStatus) values.status = row.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'
  if (def.hasFeatured) values.featured = row.featured === true
  return values
}

/** Title shown for a row in lists: default-locale text for localized fields. */
export function rowTitle(def: ResourceDef, row: Record<string, unknown>, defaultLocale: string): string {
  const raw = row[def.titleField]
  if (typeof raw === 'string') return raw
  if (typeof raw === 'object' && raw !== null) {
    const map = raw as Record<string, unknown>
    const preferred = map[defaultLocale]
    if (typeof preferred === 'string' && preferred) return preferred
    for (const v of Object.values(map)) if (typeof v === 'string' && v) return v
  }
  return '(untitled)'
}
