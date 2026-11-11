import { Download, MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

type Props = { role: string; location: string; bio: string; cvUrl: string; hasProjects: boolean }

export async function Hero({ role, location, bio, cvUrl, hasProjects }: Props) {
  const t = await getTranslations('hero')

  return (
    <section aria-labelledby="hero-title" className="mx-auto w-full max-w-5xl px-4 pb-10 pt-16 sm:pt-24">
      <p className="text-sm text-muted-foreground">{t('greeting')}</p>
      <h1 id="hero-title" className="mt-1 text-4xl font-semibold tracking-tight sm:text-6xl">
        Federico Mattucci
      </h1>
      {role && <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{role}</p>}
      {location && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden />
          {location}
        </p>
      )}
      {bio && <p className="mt-8 max-w-2xl leading-relaxed text-foreground/90">{bio}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/#contact">{t('contactMe')}</Link>
        </Button>
        {cvUrl && (
          <Button asChild variant="outline">
            <a href={cvUrl} download>
              <Download className="size-4" aria-hidden />
              {t('downloadCv')}
            </a>
          </Button>
        )}
        {hasProjects && (
          <Button asChild variant="ghost">
            <Link href="/#projects">{t('viewPortfolio')}</Link>
          </Button>
        )}
      </div>
    </section>
  )
}
