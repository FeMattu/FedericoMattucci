import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intl = createMiddleware(routing)
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token']

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(({ name }) => SESSION_COOKIES.some((c) => name === c || name.startsWith(`${c}.`)))
}

/**
 * Optimistic admin gate only: the real check is `requireAdmin()` in every admin
 * page and server action (a server action can be invoked directly).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!hasSessionCookie(request)) {
      const login = new URL('/login', request.nextUrl)
      login.searchParams.set('from', pathname)
      return NextResponse.redirect(login)
    }
    return NextResponse.next()
  }
  if (pathname === '/login') return NextResponse.next()
  return intl(request)
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
