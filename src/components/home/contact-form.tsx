'use client'

import { Send } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { sendContact, type ContactState } from '@/actions/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const initial: ContactState = { status: 'idle' }

export function ContactForm() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const [state, action, pending] = useActionState(sendContact, initial)
  const lastToast = useRef<ContactState>(initial)

  useEffect(() => {
    if (state === lastToast.current) return
    lastToast.current = state
    if (state.status === 'success') toast.success(t('success'))
    else if (state.status === 'error' && state.code === 'rateLimited') toast.error(t('rateLimited'))
    else if (state.status === 'error' && state.code === 'failed') toast.error(t('error'))
  }, [state, t])

  const errors = state.status === 'error' ? (state.errors ?? {}) : {}
  const values = state.status === 'error' ? (state.values ?? {}) : {}
  const fieldError = (field: 'name' | 'email' | 'message') => (errors[field] ? t(errors[field]) : undefined)

  return (
    <form action={action} noValidate className="space-y-4" aria-label={t('send')}>
      <input type="hidden" name="locale" value={locale} />

      {/* Honeypot: invisible to people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-name">{t('name')}</Label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          defaultValue={values.name}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
        />
        {fieldError('name') && (
          <p id="contact-name-error" role="alert" className="text-sm text-destructive">
            {fieldError('name')}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-email">{t('email')}</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={values.email}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
        />
        {fieldError('email') && (
          <p id="contact-email-error" role="alert" className="text-sm text-destructive">
            {fieldError('email')}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-subject">{t('subject')}</Label>
        <Input id="contact-subject" name="subject" defaultValue={values.subject} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">{t('message')}</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          defaultValue={values.message}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {fieldError('message') && (
          <p id="contact-message-error" role="alert" className="text-sm text-destructive">
            {fieldError('message')}
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        <Send className="size-4" aria-hidden />
        {pending ? t('sending') : t('send')}
      </Button>
    </form>
  )
}
