import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'

const { sendContact, toast } = vi.hoisted(() => ({
  sendContact: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('@/actions/contact', () => ({ sendContact }))
vi.mock('sonner', () => ({ toast }))

import { ContactForm } from '@/components/home/contact-form'

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ContactForm />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  sendContact.mockReset()
  toast.success.mockReset()
  toast.error.mockReset()
})

describe('ContactForm', () => {
  it('has labelled fields and a honeypot hidden from assistive tech', () => {
    const { container } = renderForm()
    for (const label of ['Name', 'Email', 'Subject', 'Message']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    const honeypot = container.querySelector('input[name="website"]')!
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(container.querySelector('input[name="locale"]')).toHaveValue('en')
  })

  it('shows translated, accessible field errors and keeps what was typed', async () => {
    sendContact.mockResolvedValue({
      status: 'error',
      code: 'validation',
      errors: { email: 'invalidEmail', message: 'invalidMessage' },
      values: { name: 'Ada', email: 'nope', message: 'short' },
    })
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Please enter a valid email')).toBeInTheDocument()
    expect(screen.getByText('The message must be at least 10 characters')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
  })

  it('confirms success with a toast', async () => {
    sendContact.mockResolvedValue({ status: 'success' })
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith('Message sent. Thank you!'))
  })

  it('tells the visitor when they are rate limited', async () => {
    sendContact.mockResolvedValue({ status: 'error', code: 'rateLimited' })
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith('Too many messages. Please try again later.'))
  })
})
