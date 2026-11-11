'use client'

import { Pencil } from 'lucide-react'
import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import { useIsAdmin } from '@/components/layout/use-is-admin'
import { usePathname } from '@/i18n/navigation'
import { adminHrefFor } from '@/lib/navigation'

/** Floating "Edit mode" bar, only for the signed-in admin: jumps to the editor for this page. */
export function AdminToolbar() {
  const t = useTranslations('admin')
  const pathname = usePathname()
  const isAdmin = useIsAdmin()
  if (!isAdmin) return null

  return (
    <div
      role="region"
      aria-label={t('editMode')}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border bg-background/95 py-1.5 pl-4 pr-1.5 text-sm shadow-md backdrop-blur"
    >
      <span className="text-muted-foreground">{t('editMode')}</span>
      <NextLink
        href={adminHrefFor(pathname)}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
      >
        <Pencil className="size-3.5" aria-hidden />
        {t('editThis')}
      </NextLink>
    </div>
  )
}
