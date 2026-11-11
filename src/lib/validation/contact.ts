import { z } from 'zod'

/**
 * Contact form schema. Error messages are i18n keys under `contact.*`
 * (translated where they are shown), never user-facing text.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'invalidName').max(100, 'invalidName'),
  email: z.string().trim().max(200, 'invalidEmail').email('invalidEmail'),
  subject: z
    .string()
    .trim()
    .max(150)
    .optional()
    .transform((value) => (value ? value : undefined)),
  message: z.string().trim().min(10, 'invalidMessage').max(5000, 'invalidMessage'),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactField = 'name' | 'email' | 'message'
export type ContactErrorKey = 'invalidName' | 'invalidEmail' | 'invalidMessage'
export type ContactErrors = Partial<Record<ContactField, ContactErrorKey>>

export function validateContact(
  raw: Record<string, unknown>,
): { ok: true; data: ContactInput } | { ok: false; errors: ContactErrors } {
  const result = contactSchema.safeParse(raw)
  if (result.success) return { ok: true, data: result.data }

  const errors: ContactErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (field === 'name' || field === 'email' || field === 'message') {
      errors[field] ??= issue.message as ContactErrorKey
    }
  }
  return { ok: false, errors }
}
