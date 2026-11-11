import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { db, resetDatabase } from './helpers'

const { request, notify } = vi.hoisted(() => ({
  request: { forwardedFor: '203.0.113.9, 10.0.0.1' as string | null },
  notify: vi.fn(),
}))
vi.mock('next/headers', () => ({
  headers: async () => new Headers(request.forwardedFor ? { 'x-forwarded-for': request.forwardedFor } : {}),
}))
vi.mock('@/lib/contact/mailer', () => ({ sendContactEmail: notify }))

import { sendContact } from '@/actions/contact'
import { RATE_LIMIT } from '@/lib/contact/service'

const form = (fields: Record<string, string>) => {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}
const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello, I would like to talk.', locale: 'it' }
const idle = { status: 'idle' } as const

beforeEach(async () => {
  notify.mockReset().mockResolvedValue(undefined)
  request.forwardedFor = '203.0.113.9, 10.0.0.1'
  await resetDatabase()
})

afterAll(() => db.$disconnect())

describe('sendContact', () => {
  it('stores the message with a hashed IP (never the address) and notifies', async () => {
    expect(await sendContact(idle, form(valid))).toEqual({ status: 'success' })

    const rows = await db.message.findMany()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ name: 'Ada', email: 'ada@example.com', locale: 'it', read: false })
    expect(rows[0]?.ipHash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(rows[0])).not.toContain('203.0.113.9')
    expect(notify).toHaveBeenCalledTimes(1)
  })

  it('uses only the first address of X-Forwarded-For (the client)', async () => {
    await sendContact(idle, form(valid))
    request.forwardedFor = '203.0.113.9, 192.0.2.50'
    await sendContact(idle, form(valid))
    const [a, b] = await db.message.findMany()
    expect(a?.ipHash).toBe(b?.ipHash)
  })

  it('drops honeypot submissions silently', async () => {
    expect(await sendContact(idle, form({ ...valid, website: 'http://spam.example' }))).toEqual({ status: 'success' })
    expect(await db.message.count()).toBe(0)
    expect(notify).not.toHaveBeenCalled()
  })

  it('returns field errors and the typed values so the form can re-fill', async () => {
    const result = await sendContact(idle, form({ name: 'Ada', email: 'nope', message: 'short', subject: 'Hi' }))
    expect(result).toEqual({
      status: 'error',
      code: 'validation',
      errors: { email: 'invalidEmail', message: 'invalidMessage' },
      values: { name: 'Ada', email: 'nope', subject: 'Hi', message: 'short' },
    })
    expect(await db.message.count()).toBe(0)
  })

  it('rate limits one sender after the maximum, but not another sender', async () => {
    for (let i = 0; i < RATE_LIMIT.max; i += 1) expect((await sendContact(idle, form(valid))).status).toBe('success')
    expect(await sendContact(idle, form(valid))).toMatchObject({ status: 'error', code: 'rateLimited' })
    expect(await db.message.count()).toBe(RATE_LIMIT.max)

    request.forwardedFor = '198.51.100.4'
    expect((await sendContact(idle, form(valid))).status).toBe('success')
    expect(await db.message.count()).toBe(RATE_LIMIT.max + 1)
  })

  it('forgets old messages: only the last hour counts', async () => {
    for (let i = 0; i < RATE_LIMIT.max; i += 1) await sendContact(idle, form(valid))
    await db.message.updateMany({ data: { createdAt: new Date(Date.now() - RATE_LIMIT.windowMs - 60_000) } })
    expect((await sendContact(idle, form(valid))).status).toBe('success')
  })

  it('still succeeds, and keeps the message, when the e-mail notification fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    notify.mockRejectedValue(new Error('resend down'))
    expect(await sendContact(idle, form(valid))).toEqual({ status: 'success' })
    expect(await db.message.count()).toBe(1)
    error.mockRestore()
  })

  it('works without forwarding headers (local development)', async () => {
    request.forwardedFor = null
    expect((await sendContact(idle, form(valid))).status).toBe('success')
  })
})
