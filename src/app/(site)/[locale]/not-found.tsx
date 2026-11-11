import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('common')
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-4 py-24">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('notFoundTitle')}</h1>
      <p className="mt-3 text-muted-foreground">{t('notFoundText')}</p>
      <Button asChild className="mt-8">
        <Link href="/">{t('goHome')}</Link>
      </Button>
    </div>
  )
}
