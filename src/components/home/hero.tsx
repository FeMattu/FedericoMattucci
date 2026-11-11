import { Download, MapPin } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

type Props = {
  role: string
  location: string
  bio: string
  cvUrl: string
  hasProjects: boolean
  /** Signed URL of the profile photo; the photo is optional. */
  avatarUrl?: string
}

export async function Hero({ role, location, bio, cvUrl, hasProjects, avatarUrl }: Props) {
  const t = await getTranslations('hero')

  return (
    <section aria-labelledby="hero-title" className="mx-auto w-full max-w-5xl px-4 pb-10 pt-16 sm:pt-24">
      <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
        <div className="min-w-0">
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
        </div>

        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="Federico Mattucci"
            width={320}
            height={320}
            sizes="(min-width: 640px) 160px, 112px"
            priority
            className="size-28 shrink-0 rounded-full border object-cover sm:size-40"
          />
        )}
      </div>
    </section>
  )
}
