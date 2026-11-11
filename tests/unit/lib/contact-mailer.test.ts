import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildEmail, sendContactEmail, singleLine } from '@/lib/contact/mailer'
import type { StoredMessage } from '@/lib/contact/service'

const message: StoredMessage = {
  name: 'Ada',
  email: 'ada@example.com',
  subject: 'Hello',
  message: 'Line one\nLine two',
  locale: 'it',
  ipHash: 'x',
}

describe('buildEmail', () => {
  it('sets reply-to to the sender and keeps the body as plain text', () => {
    const email = buildEmail(message, 'me@example.com', 'site@example.com')
    expect(email).toMatchObject({ to: ['me@example.com'], from: 'site@example.com', reply_to: 'ada@example.com' })
    expect(email.subject).toBe('[Site] Hello')
    expect(email.text).toContain('Line one\nLine two')
  })

  it('cannot be used for header injection', () => {
    const email = buildEmail(
      { ...message, subject: 'Hi\r\nBcc: victim@example.com', name: 'A\nB' },
      'me@example.com',
      'site@example.com',
    )
    expect(email.subject).not.toMatch(/[\r\n]/)
    expect(email.text.split('\n')[0]).not.toContain('\r')
  })

  it('falls back to the sender name when there is no subject', () => {
    expect(buildEmail({ ...message, subject: undefined }, 'a@b.c', 'x@y.z').subject).toBe('[Site] Ada')
  })
})

describe('singleLine', () => {
  it('collapses CR/LF runs', () => {
    expect(singleLine('a\r\n\nb ')).toBe('a b')
  })
})

describe('sendContactEmail', () => {
  const original = { ...process.env }
  afterEach(() => {
    process.env = { ...original }
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('does nothing when Resend is not configured', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    delete process.env.RESEND_API_KEY
    delete process.env.CONTACT_TO_EMAIL
    vi.resetModules()
    const { sendContactEmail: send } = await import('@/lib/contact/mailer')
    await send(message)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts to Resend with a bearer token and throws on a failed response', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.CONTACT_TO_EMAIL = 'me@example.com'
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 422 })
    vi.stubGlobal('fetch', fetchMock)
    vi.resetModules()
    const { sendContactEmail: send } = await import('@/lib/contact/mailer')
    await expect(send(message)).rejects.toThrow('Resend responded 422')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test')
    expect(JSON.parse(init.body as string)).toMatchObject({ to: ['me@example.com'], from: 'onboarding@resend.dev' })
  })

  it('resolves when Resend accepts the message', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.CONTACT_TO_EMAIL = 'me@example.com'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))
    vi.resetModules()
    const { sendContactEmail: send } = await import('@/lib/contact/mailer')
    await expect(send(message)).resolves.toBeUndefined()
  })

  it('exports the sender used in the module scope', () => {
    expect(typeof sendContactEmail).toBe('function')
  })
})
