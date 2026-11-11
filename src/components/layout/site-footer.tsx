import { getTranslations } from 'next-intl/server'

export async function SiteFooter() {
  const t = await getTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          © {year} Federico Mattucci. {t('rights')}
        </p>
        <p>{t('builtWith')}</p>
      </div>
    </footer>
  )
}
