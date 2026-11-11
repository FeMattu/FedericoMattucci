'use server'

import { headers } from 'next/headers'
import { sendContactEmail } from '@/lib/contact/mailer'
import { submitContact } from '@/lib/contact/service'
import { messagesRepository } from '@/lib/db/repositories/messages'
import type { ContactErrors } from '@/lib/validation/contact'

export type ContactValues = { name?: string; email?: string; subject?: string; message?: string }

export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  /** `values` lets the form re-fill itself: React 19 resets uncontrolled forms after an action. */
  | { status: 'error'; code: 'validation' | 'rateLimited' | 'failed'; errors?: ContactErrors; values?: ContactValues }

/** Public form action: honeypot, validation, DB rate limit, store, best-effort e-mail. */
export async function sendContact(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const forwarded = (await headers()).get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

  const result = await submitContact(
    Object.fromEntries(formData),
    {
      ip,
      locale: typeof formData.get('locale') === 'string' ? (formData.get('locale') as string) : undefined,
      secret: process.env.AUTH_SECRET ?? 'dev-secret',
    },
    {
      countRecent: messagesRepository.countSince,
      save: messagesRepository.create,
      notify: sendContactEmail,
    },
  )

  if (result.status === 'success') return { status: 'success' }

  const text = (key: string) => (typeof formData.get(key) === 'string' ? (formData.get(key) as string) : undefined)
  const values: ContactValues = {
    name: text('name'),
    email: text('email'),
    subject: text('subject'),
    message: text('message'),
  }
  return result.code === 'validation'
    ? { status: 'error', code: 'validation', errors: result.errors, values }
    : { status: 'error', code: result.code, values }
}
