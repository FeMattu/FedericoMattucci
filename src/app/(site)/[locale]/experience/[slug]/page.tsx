import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { DetailPage } from '@/components/detail/detail-page'
import { locales } from '@/i18n/config'
import { getExperience, listSlugs } from '@/lib/content'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const { experiences } = await listSlugs()
  return locales.flatMap((locale) => experiences.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const item = await getExperience(locale, slug)
  if (!item) return {}
  const title = `${item.role} · ${item.organization}`
  return {
    title,
    description: item.summary,
    alternates: {
      canonical: `/${locale}/experience/${slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/experience/${slug}`])),
    },
    openGraph: { title, description: item.summary, type: 'article' },
  }
}

export default async function ExperiencePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const [item, t, tn] = await Promise.all([
    getExperience(locale, slug),
    getTranslations('common'),
    getTranslations('nav'),
  ])
  if (!item) notFound()

  return (
    <DetailPage
      backTo="experience"
      backLabel={tn('experience')}
      title={item.role}
      subtitle={item.organization}
      meta={[
        { label: t('period'), value: item.period },
        ...(item.location ? [{ label: t('location'), value: item.location }] : []),
      ]}
      summary={item.summary}
      description={item.description}
      highlights={item.highlights}
      tags={item.tags}
      links={item.url ? [{ href: item.url, label: t('links') }] : []}
    />
  )
}
