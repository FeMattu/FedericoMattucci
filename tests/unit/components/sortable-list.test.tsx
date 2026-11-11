import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const actions = vi.hoisted(() => ({
  deleteItem: vi.fn(),
  duplicateItem: vi.fn(),
  reorderItems: vi.fn(),
  setItemFeatured: vi.fn(),
  setItemStatus: vi.fn(),
}))
const router = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('@/actions/admin', () => actions)
vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))
vi.mock('sonner', () => ({ toast }))

import { SortableList, type ListItem } from '@/components/admin/sortable-list'

const items: ListItem[] = [
  { id: 'a', title: 'Alpha', subtitle: 'First', status: 'PUBLISHED', featured: true },
  { id: 'b', title: 'Beta', status: 'DRAFT', featured: false },
]

const renderList = (overrides: Partial<React.ComponentProps<typeof SortableList>> = {}) =>
  render(
    <SortableList resource="experience" singular="Experience" items={items} hasStatus hasFeatured canDuplicate {...overrides} />,
  )

beforeEach(() => {
  for (const fn of Object.values(actions)) fn.mockReset().mockResolvedValue({ ok: true, data: undefined })
  router.refresh.mockReset()
  toast.success.mockReset()
  toast.error.mockReset()
})

describe('SortableList', () => {
  it('lists items in order with edit links, status and a labelled drag handle', () => {
    renderList()
    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Alpha', 'Beta'])
    expect(links[0]).toHaveAttribute('href', '/admin/experience/a')
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reorder Alpha/ })).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('publishes and unpublishes through the status switch', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('switch', { name: 'Published: Beta' }))
    await waitFor(() => expect(actions.setItemStatus).toHaveBeenCalledWith('experience', 'b', 'PUBLISHED'))
    await user.click(screen.getByRole('switch', { name: 'Published: Alpha' }))
    await waitFor(() => expect(actions.setItemStatus).toHaveBeenCalledWith('experience', 'a', 'DRAFT'))
    expect(router.refresh).toHaveBeenCalled()
  })

  it('toggles featured and duplicates', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('button', { name: 'Remove Alpha from featured' }))
    await waitFor(() => expect(actions.setItemFeatured).toHaveBeenCalledWith('experience', 'a', false))
    await user.click(screen.getByRole('button', { name: 'Duplicate Beta' }))
    await waitFor(() => expect(actions.duplicateItem).toHaveBeenCalledWith('experience', 'b'))
  })

  it('asks for confirmation before deleting, and deletes only after confirming', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('button', { name: 'Delete Alpha' }))
    expect(actions.deleteItem).not.toHaveBeenCalled()
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('permanently deleted')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(actions.deleteItem).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Delete Alpha' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(actions.deleteItem).toHaveBeenCalledWith('experience', 'a'))
    expect(toast.success).toHaveBeenCalledWith('Deleted')
  })

  it('shows a friendly error when an action is rejected', async () => {
    actions.setItemStatus.mockResolvedValue({ ok: false, error: 'unauthorized' })
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('switch', { name: 'Published: Beta' }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Your session has expired. Please sign in again.'))
  })

  it('hides controls the resource does not have', () => {
    renderList({ hasStatus: false, hasFeatured: false, canDuplicate: false })
    expect(screen.queryByRole('switch')).toBeNull()
    expect(screen.queryByRole('button', { name: /Duplicate/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /featured|Feature/ })).toBeNull()
  })

  it('renders an empty state', () => {
    renderList({ items: [] })
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()
  })
})
