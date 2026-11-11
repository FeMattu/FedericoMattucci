import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAdmin, pathname } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  pathname: { current: '/admin' },
}))
vi.mock('@/lib/auth/session', () => ({ requireAdmin }))
vi.mock('@/auth', () => ({ signOut: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current, useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }) }))

import AdminLayout from '@/app/(admin)/admin/layout'
import { AdminHint } from '@/components/admin/admin-hint'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ADMIN_HINT_KEY } from '@/lib/navigation'

beforeEach(() => {
  requireAdmin.mockReset()
  pathname.current = '/admin'
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  })
})

describe('AdminLayout (the only place with a sidebar)', () => {
  it('renders the sidebar and the page for the signed-in admin', async () => {
    requireAdmin.mockResolvedValue({ user: { email: 'admin@example.com' } })
    render(<TooltipProvider>{await AdminLayout({ children: <p>page content</p> })}</TooltipProvider>)

    expect(screen.getByText('page content')).toBeInTheDocument()
    expect(document.querySelector('[data-sidebar="sidebar"], [data-slot="sidebar"]')).not.toBeNull()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
  })

  it('renders nothing of the admin area when there is no admin session', async () => {
    requireAdmin.mockRejectedValue(new Error('NEXT_REDIRECT:/login'))
    await expect(AdminLayout({ children: <p>secret</p> })).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(screen.queryByText('secret')).toBeNull()
    expect(document.querySelector('[data-slot="sidebar"]')).toBeNull()
  })
})

describe('AdminSidebar', () => {
  const renderSidebar = () =>
    render(
      <TooltipProvider>
        <SidebarProvider>
          <AdminSidebar email="admin@example.com" signOutAction={vi.fn()} />
        </SidebarProvider>
      </TooltipProvider>,
    )

  it('links to every editor, a way back to the site and sign out', () => {
    renderSidebar()
    for (const [name, href] of [
      ['Dashboard', '/admin'],
      ['Site texts', '/admin/site-texts'],
      ['Experience', '/admin/experience'],
      ['Education', '/admin/education'],
      ['Skills', '/admin/skills'],
      ['Projects', '/admin/projects'],
      ['Certifications', '/admin/certifications'],
      ['Photos', '/admin/photos'],
      ['Albums', '/admin/albums'],
      ['Social links', '/admin/social-links'],
      ['Languages', '/admin/languages'],
      ['Messages', '/admin/messages'],
      ['View site', '/'],
    ] as const) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('marks only the current section as active', () => {
    pathname.current = '/admin/experience/abc'
    renderSidebar()
    const nav = screen.getAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'page')
    expect(nav).toHaveLength(1)
    expect(within(nav[0]!).getByText('Experience')).toBeInTheDocument()
  })

  it('does not mark Dashboard active on nested pages', () => {
    pathname.current = '/admin/photos'
    renderSidebar()
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Photos' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('AdminHint', () => {
  it('remembers in this browser that an admin signed in', () => {
    localStorage.removeItem(ADMIN_HINT_KEY)
    render(<AdminHint />)
    expect(localStorage.getItem(ADMIN_HINT_KEY)).toBe('1')
  })
})
