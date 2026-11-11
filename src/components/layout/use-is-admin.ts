'use client'

import { useEffect, useState } from 'react'
import { ADMIN_HINT_KEY } from '@/lib/navigation'

/**
 * True when the visitor is the signed-in admin. Public pages are static, so
 * this is decided in the browser: only browsers that carry the admin hint
 * (set in /admin) ever call the session endpoint, and the hint is dropped
 * again when the session turns out to be gone. Purely cosmetic: the server
 * re-checks the session on every admin page and action.
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let hinted = false
    try {
      hinted = localStorage.getItem(ADMIN_HINT_KEY) === '1'
    } catch {
      return
    }
    if (!hinted) return

    const controller = new AbortController()
    fetch('/api/auth/session', { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((session: { user?: unknown } | null) => {
        const signedIn = !!session?.user
        setIsAdmin(signedIn)
        if (!signedIn) {
          try {
            localStorage.removeItem(ADMIN_HINT_KEY)
          } catch {
            // Optional hint only.
          }
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  return isAdmin
}
