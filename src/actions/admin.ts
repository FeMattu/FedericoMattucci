'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { RESOURCES, isResourceKey, type ResourceKey } from '@/lib/admin/resources'
import { buildSchema, toPrismaData } from '@/lib/admin/schema'
import { UnauthorizedError, assertAdmin } from '@/lib/auth/session'
import { adminRepository as repo } from '@/lib/db/repositories/admin'

export type ActionError = 'unauthorized' | 'notFound' | 'validation' | 'conflict' | 'failed'
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError; fieldErrors?: Record<string, string> }

const MAX_REORDER = 500

/** Every action starts here. Returns a result instead of throwing so the UI can toast it. */
async function authorize(): Promise<ActionResult<never> | null> {
  try {
    await assertAdmin()
    return null
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: 'unauthorized' }
    throw error
  }
}

function resolve(resource: string): ResourceKey | null {
  return isResourceKey(resource) ? resource : null
}

/** Public pages are static: refresh all of them after any content change. */
function revalidateSite() {
  revalidatePath('/', 'layout')
}

function mapError(error: unknown): ActionError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return 'conflict'
    if (error.code === 'P2025') return 'notFound'
  }
  console.error('Admin action failed', error instanceof Error ? error.message : error)
  return 'failed'
}

/** Create (id = null) or update one item from a form payload. */
export async function saveItem(resource: string, id: string | null, payload: unknown): Promise<ActionResult<{ id: string }>> {
  const denied = await authorize()
  if (denied) return denied
  const key = resolve(resource)
  if (!key) return { ok: false, error: 'notFound' }
  const def = RESOURCES[key]
  if (!id && def.createFromUpload) return { ok: false, error: 'notFound' }

  const parsed = buildSchema(def, await repo.defaultLocale()).safeParse(payload)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? '_')] ??= issue.message
    return { ok: false, error: 'validation', fieldErrors }
  }

  try {
    const data = toPrismaData(def, parsed.data)
    const row = id ? await repo.update(key, id, data) : await repo.create(key, data)
    revalidateSite()
    return { ok: true, data: { id: row.id } }
  } catch (error) {
    return { ok: false, error: mapError(error) }
  }
}

export async function deleteItem(resource: string, id: string): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  const key = resolve(resource)
  if (!key) return { ok: false, error: 'notFound' }
  try {
    await repo.remove(key, id)
    revalidateSite()
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: mapError(error) }
  }
}

export async function duplicateItem(resource: string, id: string): Promise<ActionResult<{ id: string }>> {
  const denied = await authorize()
  if (denied) return denied
  const key = resolve(resource)
  if (!key) return { ok: false, error: 'notFound' }
  try {
    const copy = await repo.duplicate(key, id)
    if (!copy) return { ok: false, error: 'notFound' }
    revalidateSite()
    return { ok: true, data: { id: copy.id } }
  } catch (error) {
    return { ok: false, error: mapError(error) }
  }
}

/** Persist a drag-and-drop order: `ids` in their new order. */
export async function reorderItems(resource: string, ids: unknown): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  const key = resolve(resource)
  if (!key || !RESOURCES[key].ordered) return { ok: false, error: 'notFound' }
  if (
    !Array.isArray(ids) ||
    ids.length > MAX_REORDER ||
    !ids.every((id) => typeof id === 'string' && id.length > 0) ||
    new Set(ids).size !== ids.length
  ) {
    return { ok: false, error: 'validation' }
  }
  try {
    await repo.reorder(key, ids as string[])
    revalidateSite()
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: mapError(error) }
  }
}

export async function setItemStatus(resource: string, id: string, status: unknown): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  const key = resolve(resource)
  if (!key || !RESOURCES[key].hasStatus) return { ok: false, error: 'notFound' }
  if (status !== 'DRAFT' && status !== 'PUBLISHED') return { ok: false, error: 'validation' }
  try {
    await repo.setStatus(key, id, status)
    revalidateSite()
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: mapError(error) }
  }
}

export async function setItemFeatured(resource: string, id: string, featured: unknown): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  const key = resolve(resource)
  if (!key || !RESOURCES[key].hasFeatured) return { ok: false, error: 'notFound' }
  if (typeof featured !== 'boolean') return { ok: false, error: 'validation' }
  try {
    await repo.setFeatured(key, id, featured)
    revalidateSite()
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: mapError(error) }
  }
}
