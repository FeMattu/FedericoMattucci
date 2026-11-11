import { render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import { NAV_SECTIONS } from '@/lib/navigation'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}))
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'system', setTheme: vi.fn() }) }))

import { SiteHeader } from '@/components/layout/site-header'

function renderHeader(isAdmin = false) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <SiteHeader isAdmin={isAdmin} />
    </NextIntlClientProvider>,
  )
}

describe('SiteHeader', () => {
  it('renders a top navigation with every section link', () => {
    renderHeader()
    const header = screen.getByRole('banner')
    const nav = within(header).getAllByRole('navigation', { name: 'Main navigation' })[0]!
    for (const id of NAV_SECTIONS) {
      expect(within(nav).getByRole('link', { name: en.nav[id] })).toHaveAttribute('href', `/#${id}`)
    }
  })

  it('never renders a sidebar on the public site', () => {
    const { container } = renderHeader()
    expect(container.querySelector('aside, [data-sidebar], [data-slot="sidebar"]')).toBeNull()
  })

  it('offers a menu button for mobile', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('shows the Admin entry only for an admin', () => {
    const { unmount } = renderHeader(false)
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()
    unmount()
    renderHeader(true)
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
  })
})
