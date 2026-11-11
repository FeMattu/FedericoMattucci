/**
 * Who may sign in. One person: the address in `ADMIN_EMAIL`.
 * Fail closed: no configured address means nobody is an admin.
 */
export function isAdminEmail(email: string | null | undefined, adminEmail: string | null | undefined): boolean {
  const a = email?.trim().toLowerCase()
  const b = adminEmail?.trim().toLowerCase()
  return !!a && !!b && a === b
}

/**
 * Where to send the admin after sign-in. Only same-site admin paths are
 * allowed, so the `from` query parameter cannot become an open redirect.
 */
export function safeAdminPath(from: string | null | undefined): string {
  if (!from || !from.startsWith('/admin')) return '/admin'
  if (from.startsWith('//') || from.includes('\\') || /[\r\n]/.test(from)) return '/admin'
  const rest = from.slice('/admin'.length)
  return rest === '' || rest.startsWith('/') || rest.startsWith('?') ? from : '/admin'
}
