import { localizedFields, type ResourceDef } from './resources'

type Row = Record<string, unknown>

function hasText(value: unknown, code: string): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const entry = (value as Record<string, unknown>)[code]
  return Array.isArray(entry) ? entry.some((l) => typeof l === 'string' && l.trim() !== '') : typeof entry === 'string' && entry.trim() !== ''
}

/**
 * Per language: how many translatable values exist in the default language
 * but are still empty in that language. A value nobody wrote in the default
 * language is not "missing" anywhere.
 */
export function missingTranslations(
  def: ResourceDef,
  rows: readonly Row[],
  localeCodes: readonly string[],
  defaultLocale: string,
): Record<string, number> {
  const result: Record<string, number> = Object.fromEntries(localeCodes.map((c) => [c, 0]))
  const fields = localizedFields(def)
  for (const row of rows) {
    for (const field of fields) {
      const value = row[field.name]
      if (!hasText(value, defaultLocale)) continue
      for (const code of localeCodes) {
        if (code !== defaultLocale && !hasText(value, code)) result[code] = (result[code] ?? 0) + 1
      }
    }
  }
  return result
}

/** Sums several per-language counts (e.g. across resources). */
export function sumCounts(parts: readonly Record<string, number>[]): Record<string, number> {
  const total: Record<string, number> = {}
  for (const part of parts) for (const [code, n] of Object.entries(part)) total[code] = (total[code] ?? 0) + n
  return total
}
