import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isAdminEmail, safeAdminPath } from '@/lib/auth/allowlist'

const { auth, redirect } = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn((to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`)
  }),
}))
vi.mock('@/auth', () => ({ auth }))
vi.mock('next/navigation', () => ({ redirect }))

import { UnauthorizedError, assertAdmin, getAdminSession, requireAdmin } from '@/lib/auth/session'

describe('isAdminEmail', () => {
  it('matches the configured address case-insensitively', () => {
    expect(isAdminEmail('Me@Example.com', 'me@example.com')).toBe(true)
    expect(isAdminEmail(' me@example.com ', 'ME@example.com')).toBe(true)
  })

  it('rejects other addresses', () => {
    expect(isAdminEmail('other@example.com', 'me@example.com')).toBe(false)
    expect(isAdminEmail('me@example.com.evil.io', 'me@example.com')).toBe(false)
  })

  it('fails closed when either side is missing', () => {
    expect(isAdminEmail(undefined, 'me@example.com')).toBe(false)
    expect(isAdminEmail('me@example.com', undefined)).toBe(false)
    expect(isAdminEmail('', '')).toBe(false)
    expect(isAdminEmail(null, null)).toBe(false)
  })
})

describe('safeAdminPath', () => {
  it('keeps admin paths', () => {
    expect(safeAdminPath('/admin')).toBe('/admin')
    expect(safeAdminPath('/admin/experience/abc?x=1')).toBe('/admin/experience/abc?x=1')
  })

  it.each([null, undefined, '', '/', '/en', 'https://evil.com', '//evil.com', '/adminx', '/admin\\evil', '/admin\nSet-Cookie: a=b'])(
    'falls back to /admin for %j',
    (from) => {
      expect(safeAdminPath(from)).toBe('/admin')
    },
  )
})

describe('admin session guards', () => {
  beforeEach(() => {
    auth.mockReset()
    redirect.mockClear()
    process.env.ADMIN_EMAIL = 'me@example.com'
  })

  it('accepts the admin session', async () => {
    auth.mockResolvedValue({ user: { email: 'me@example.com' } })
    await expect(getAdminSession()).resolves.not.toBeNull()
    await expect(assertAdmin()).resolves.toBeTruthy()
    await expect(requireAdmin()).resolves.toBeTruthy()
  })

  it('treats a signed-in non-admin like an anonymous visitor', async () => {
    auth.mockResolvedValue({ user: { email: 'stranger@example.com' } })
    await expect(getAdminSession()).resolves.toBeNull()
    await expect(assertAdmin()).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('rejects when there is no session, with a 401', async () => {
    auth.mockResolvedValue(null)
    const error = await assertAdmin().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(UnauthorizedError)
    expect((error as UnauthorizedError).status).toBe(401)
  })

  it('redirects pages to the login page', async () => {
    auth.mockResolvedValue(null)
    await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT:/login')
  })

  it('denies everyone when ADMIN_EMAIL is not configured', async () => {
    delete process.env.ADMIN_EMAIL
    auth.mockResolvedValue({ user: { email: 'me@example.com' } })
    await expect(assertAdmin()).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
