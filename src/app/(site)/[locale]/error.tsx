'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div role="alert" className="mx-auto flex w-full max-w-3xl flex-col items-start px-4 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{t('errorTitle')}</h1>
      <p className="mt-3 text-muted-foreground">{t('errorText')}</p>
      <Button onClick={reset} className="mt-8">
        {t('retry')}
      </Button>
    </div>
  )
}
