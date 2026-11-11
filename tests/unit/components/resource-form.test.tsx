import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { saveItem, router, toast } = vi.hoisted(() => ({
  saveItem: vi.fn(),
  router: { push: vi.fn(), refresh: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('@/actions/admin', () => ({ saveItem }))
vi.mock('@/actions/uploads', () => ({ requestUpload: vi.fn(), registerPhoto: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('sonner', () => ({ toast }))

import { ResourceForm } from '@/components/admin/resource-form'
import { RESOURCES } from '@/lib/admin/resources'
import { toFormValues } from '@/lib/admin/schema'

const locales = [
  { code: 'it', name: 'Italiano', isDefault: true },
  { code: 'en', name: 'English', isDefault: false },
]

const renderForm = (id: string | null = null, row: Record<string, unknown> = { status: 'PUBLISHED' }) =>
  render(
    <ResourceForm
      def={RESOURCES.experience}
      id={id}
      initial={toFormValues(RESOURCES.experience, row)}
      locales={locales}
      options={{}}
    />,
  )

beforeEach(() => {
  saveItem.mockReset()
  router.push.mockReset()
  router.refresh.mockReset()
  toast.success.mockReset()
  toast.error.mockReset()
})

describe('ResourceForm', () => {
  it('renders every field of the definition with labels and translation tabs', () => {
    renderForm()
    expect(screen.getByLabelText(/Organization/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Start date/)).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText(/Technologies/)).toBeInTheDocument()
    // Translatable fields: Role, Summary, Description, Responsibilities -> one tab per language each.
    expect(screen.getAllByRole('tab', { name: /Italiano/ })).toHaveLength(4)
    expect(screen.getAllByRole('tab', { name: /English/ })).toHaveLength(4)
    expect(screen.getByRole('switch', { name: 'Published' })).toBeChecked()
  })

  it('marks languages with no text yet', () => {
    renderForm(null, { role: { it: 'Capo' }, status: 'PUBLISHED' })
    const roleTabs = screen.getAllByRole('tab', { name: /English/ })
    expect(within(roleTabs[0]!).getByRole('img', { name: 'no translation yet' })).toBeInTheDocument()
  })

  it('submits the typed values, then returns to the list', async () => {
    saveItem.mockResolvedValue({ ok: true, data: { id: 'new-id' } })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText(/Organization/), 'JEVIS')
    await user.type(screen.getByLabelText(/Start date/), '2026-02-01')
    await user.type(screen.getAllByRole('textbox', { name: /Role/ })[0]!, 'Responsabile IT')
    await user.click(screen.getByRole('button', { name: 'Create experience' }))

    await waitFor(() => expect(saveItem).toHaveBeenCalledTimes(1))
    const [resource, id, payload] = saveItem.mock.calls[0] as [string, string | null, Record<string, unknown>]
    expect(resource).toBe('experience')
    expect(id).toBeNull()
    expect(payload).toMatchObject({
      organization: 'JEVIS',
      startDate: '2026-02-01',
      role: { it: 'Responsabile IT' },
      status: 'PUBLISHED',
    })
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/admin/experience'))
    expect(toast.success).toHaveBeenCalledWith('Experience created')
  })

  it('edits an existing item with its id', async () => {
    saveItem.mockResolvedValue({ ok: true, data: { id: 'abc' } })
    const user = userEvent.setup()
    renderForm('abc', { organization: 'Old', startDate: new Date(Date.UTC(2020, 0, 1)), status: 'DRAFT' })
    expect(screen.getByLabelText(/Organization/)).toHaveValue('Old')
    expect(screen.getByLabelText(/Start date/)).toHaveValue('2020-01-01')
    expect(screen.getByRole('switch', { name: 'Published' })).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(saveItem).toHaveBeenCalledWith('experience', 'abc', expect.objectContaining({ organization: 'Old', status: 'DRAFT' })))
  })

  it('shows field errors from the server and stays on the page', async () => {
    saveItem.mockResolvedValue({
      ok: false,
      error: 'validation',
      fieldErrors: { organization: 'required', startDate: 'invalidDate' },
    })
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Create experience' }))

    expect(await screen.findByText('This field is required.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid date.')).toBeInTheDocument()
    expect(screen.getByLabelText(/Organization/)).toHaveAttribute('aria-invalid', 'true')
    expect(router.push).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Some fields are not valid. Check the highlighted fields.')
  })

  it('tells the admin when the session has expired', async () => {
    saveItem.mockResolvedValue({ ok: false, error: 'unauthorized' })
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Create experience' }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Your session has expired. Please sign in again.'))
  })

  it('adds and removes technology tags with the keyboard', async () => {
    const user = userEvent.setup()
    renderForm()
    const tags = screen.getByLabelText(/Technologies/)
    await user.type(tags, 'Angular{Enter}Spring Boot,')
    expect(screen.getByRole('button', { name: 'Remove Angular' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Spring Boot' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Angular' }))
    expect(screen.queryByRole('button', { name: 'Remove Angular' })).toBeNull()
  })
})
