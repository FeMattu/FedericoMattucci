import { createHash } from 'node:crypto'
import { validateContact, type ContactErrors, type ContactInput } from '@/lib/validation/contact'

export const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 }

export type StoredMessage = ContactInput & { locale?: string; ipHash: string }

/** All I/O is injected so the rules below are unit-testable. */
export type ContactDeps = {
  countRecent: (ipHash: string, since: Date) => Promise<number>
  save: (message: StoredMessage) => Promise<void>
  /** Best-effort e-mail notification. Failures never lose the stored message. */
  notify: (message: StoredMessage) => Promise<void>
  now?: () => Date
}

export type ContactResult =
  | { status: 'success' }
  | { status: 'error'; code: 'validation'; errors: ContactErrors }
  | { status: 'error'; code: 'rateLimited' }
  | { status: 'error'; code: 'failed' }

/** Rate limiting key: a salted hash, so raw addresses are never stored. */
export function hashIp(ip: string, secret: string): string {
  return createHash('sha256').update(`${secret}:${ip}`).digest('hex')
}

export async function submitContact(
  raw: Record<string, unknown>,
  context: { ip: string; locale?: string; secret: string },
  deps: ContactDeps,
): Promise<ContactResult> {
  // Honeypot: real users never see or fill this field. Pretend success, store nothing.
  if (typeof raw.website === 'string' && raw.website.trim() !== '') return { status: 'success' }

  const parsed = validateContact(raw)
  if (!parsed.ok) return { status: 'error', code: 'validation', errors: parsed.errors }

  const now = (deps.now ?? (() => new Date()))()
  const ipHash = hashIp(context.ip, context.secret)

  try {
    const recent = await deps.countRecent(ipHash, new Date(now.getTime() - RATE_LIMIT.windowMs))
    if (recent >= RATE_LIMIT.max) return { status: 'error', code: 'rateLimited' }

    const message: StoredMessage = { ...parsed.data, locale: context.locale, ipHash }
    await deps.save(message)
    await deps.notify(message).catch((error: unknown) => {
      console.error('Contact notification failed', error instanceof Error ? error.message : error)
    })
    return { status: 'success' }
  } catch (error) {
    console.error('Contact submission failed', error instanceof Error ? error.message : error)
    return { status: 'error', code: 'failed' }
  }
}
