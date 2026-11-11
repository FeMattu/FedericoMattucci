import { describe, expect, it, vi } from 'vitest'
import { RATE_LIMIT, hashIp, submitContact, type ContactDeps } from '@/lib/contact/service'
import { validateContact } from '@/lib/validation/contact'

const valid = { name: 'Ada', email: 'ada@example.com', subject: '', message: 'Hello, I would like to talk.' }
const context = { ip: '203.0.113.7', locale: 'en', secret: 's3cret' }

function deps(overrides: Partial<ContactDeps> = {}): ContactDeps & { save: ReturnType<typeof vi.fn> } {
  return {
    countRecent: vi.fn().mockResolvedValue(0),
    save: vi.fn().mockResolvedValue(undefined),
    notify: vi.fn().mockResolvedValue(undefined),
    now: () => new Date('2026-11-11T12:00:00Z'),
    ...overrides,
  } as ContactDeps & { save: ReturnType<typeof vi.fn> }
}

describe('validateContact', () => {
  it('accepts a valid message and drops an empty subject', () => {
    const result = validateContact(valid)
    expect(result.ok && result.data.subject).toBeUndefined()
  })

  it('returns i18n keys per field, never user-facing text', () => {
    const result = validateContact({ name: ' ', email: 'nope', message: 'short' })
    expect(result).toEqual({
      ok: false,
      errors: { name: 'invalidName', email: 'invalidEmail', message: 'invalidMessage' },
    })
  })

  it('rejects oversized input', () => {
    expect(validateContact({ ...valid, message: 'x'.repeat(5001) }).ok).toBe(false)
    expect(validateContact({ ...valid, name: 'x'.repeat(101) }).ok).toBe(false)
  })
})

describe('submitContact', () => {
  it('stores the message with a hashed IP and notifies', async () => {
    const d = deps()
    expect(await submitContact(valid, context, d)).toEqual({ status: 'success' })
    expect(d.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ada', locale: 'en', ipHash: hashIp(context.ip, context.secret) }),
    )
    expect(d.notify).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(vi.mocked(d.save).mock.calls)).not.toContain(context.ip)
  })

  it('silently drops honeypot submissions without storing or notifying', async () => {
    const d = deps()
    expect(await submitContact({ ...valid, website: 'http://spam.example' }, context, d)).toEqual({ status: 'success' })
    expect(d.save).not.toHaveBeenCalled()
    expect(d.notify).not.toHaveBeenCalled()
  })

  it('returns validation errors without touching the database', async () => {
    const d = deps()
    const result = await submitContact({ ...valid, email: 'bad' }, context, d)
    expect(result).toMatchObject({ status: 'error', code: 'validation', errors: { email: 'invalidEmail' } })
    expect(d.countRecent).not.toHaveBeenCalled()
  })

  it('rate limits at the configured maximum within the window', async () => {
    const d = deps({ countRecent: vi.fn().mockResolvedValue(RATE_LIMIT.max) })
    expect(await submitContact(valid, context, d)).toEqual({ status: 'error', code: 'rateLimited' })
    expect(d.save).not.toHaveBeenCalled()
    const since = vi.mocked(d.countRecent).mock.calls[0]?.[1] as Date
    expect(new Date('2026-11-11T12:00:00Z').getTime() - since.getTime()).toBe(RATE_LIMIT.windowMs)
  })

  it('allows a sender just below the limit', async () => {
    const d = deps({ countRecent: vi.fn().mockResolvedValue(RATE_LIMIT.max - 1) })
    expect(await submitContact(valid, context, d)).toEqual({ status: 'success' })
  })

  it('keeps the stored message when the e-mail notification fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const d = deps({ notify: vi.fn().mockRejectedValue(new Error('resend down')) })
    expect(await submitContact(valid, context, d)).toEqual({ status: 'success' })
    expect(d.save).toHaveBeenCalled()
    error.mockRestore()
  })

  it('reports a failure when the database write fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const d = deps({ save: vi.fn().mockRejectedValue(new Error('db down')) })
    expect(await submitContact(valid, context, d)).toEqual({ status: 'error', code: 'failed' })
    error.mockRestore()
  })
})

describe('hashIp', () => {
  it('is stable, salted and does not contain the address', () => {
    expect(hashIp('1.2.3.4', 'a')).toBe(hashIp('1.2.3.4', 'a'))
    expect(hashIp('1.2.3.4', 'a')).not.toBe(hashIp('1.2.3.4', 'b'))
    expect(hashIp('1.2.3.4', 'a')).not.toContain('1.2.3.4')
  })
})
