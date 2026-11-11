'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { isSiteTextKey, isValidLocaleCode } from '@/lib/admin/site-texts'
import { cleanLocalized } from '@/lib/admin/schema'
import { UnauthorizedError, assertAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import type { ActionResult } from './admin'

async function authorize(): Promise<ActionResult<never> | null> {
  try {
    await assertAdmin()
    return null
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: 'unauthorized' }
    throw error
  }
}

const refresh = () => revalidatePath('/', 'layout')

/** Save one site text for all languages. An all-empty value deletes the row. */
export async function saveSiteText(key: string, value: unknown): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  if (!isSiteTextKey(key)) return { ok: false, error: 'notFound' }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return { ok: false, error: 'validation' }

  const cleaned = cleanLocalized(value as Record<string, string>)
  try {
    if (Object.keys(cleaned).length === 0) await prisma.siteText.deleteMany({ where: { key } })
    else await prisma.siteText.upsert({ where: { key }, update: { value: cleaned }, create: { key, value: cleaned } })
    refresh()
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'failed' }
  }
}

/** Adds a content language. The public UI also needs messages/<code>.json (see docs). */
export async function addLocale(code: unknown, name: unknown): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  if (typeof code !== 'string' || typeof name !== 'string' || !isValidLocaleCode(code) || name.trim() === '' || name.length > 60) {
    return { ok: false, error: 'validation' }
  }
  try {
    const position = await prisma.locale.count()
    await prisma.locale.create({ data: { code, name: name.trim(), position, enabled: true } })
    refresh()
    return { ok: true, data: undefined }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { ok: false, error: 'conflict' }
    return { ok: false, error: 'failed' }
  }
}

/** The default language cannot be disabled: it is the fallback for missing translations. */
export async function setLocaleEnabled(code: string, enabled: unknown): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  if (typeof enabled !== 'boolean') return { ok: false, error: 'validation' }
  const locale = await prisma.locale.findUnique({ where: { code } })
  if (!locale) return { ok: false, error: 'notFound' }
  if (locale.isDefault && !enabled) return { ok: false, error: 'validation' }
  await prisma.locale.update({ where: { code }, data: { enabled } })
  refresh()
  return { ok: true, data: undefined }
}

export async function setMessageRead(id: string, read: unknown): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  if (typeof read !== 'boolean') return { ok: false, error: 'validation' }
  try {
    await prisma.message.update({ where: { id }, data: { read } })
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'notFound' }
  }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const denied = await authorize()
  if (denied) return denied
  try {
    await prisma.message.delete({ where: { id } })
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'notFound' }
  }
}
