'use client'

import { useEffect } from 'react'
import { ADMIN_HINT_KEY } from '@/lib/navigation'

/**
 * Remembers in this browser that an admin is signed in, so the (static) public
 * pages can show the Admin link without anonymous visitors ever calling the
 * session endpoint. It is only a UI hint: every action still checks the session.
 */
export function AdminHint() {
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_HINT_KEY, '1')
    } catch {
      // Storage can be blocked (private mode); the hint is optional.
    }
  }, [])
  return null
}
