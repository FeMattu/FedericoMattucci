import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isAdminEmail } from './allowlist'

/** Thrown by `assertAdmin` when a server action is called without an admin session. */
export class UnauthorizedError extends Error {
  readonly status = 401
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

/** The session, but only if it belongs to the admin. Re-checked on every call, never cached. */
export async function getAdminSession() {
  const session = await auth()
  return isAdminEmail(session?.user?.email, process.env.ADMIN_EMAIL) ? session : null
}

/** For pages and layouts: redirects to the login page. */
export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) redirect('/login')
  return session
}

/** For server actions and route handlers: throws, so nothing after it runs. */
export async function assertAdmin() {
  const session = await getAdminSession()
  if (!session) throw new UnauthorizedError()
  return session
}
