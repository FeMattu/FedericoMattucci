import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { DetailPage } from '@/components/detail/detail-page'
import { locales } from '@/i18n/config'
import { getEducation, listSlugs } from '@/lib/content'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 86400

export async function generateStaticParams() {
  const { education } = await listSlugs()
  return locales.flatMap((locale) => education.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const item = await getEducation(locale, slug)
  if (!item) return {}
  const title = `${item.title} · ${item.institution}`
  const description = item.summary || undefined
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/education/${slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/education/${slug}`])),
    },
    openGraph: { title, description, type: 'article' },
  }
}

export default async function EducationPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const [item, t, tn] = await Promise.all([
    getEducation(locale, slug),
    getTranslations('common'),
    getTranslations('nav'),
  ])
  if (!item) notFound()

  return (
    <DetailPage
      backTo="education"
      backLabel={tn('education')}
      title={item.title}
      subtitle={item.institution}
      meta={[
        { label: t('period'), value: item.period },
        ...(item.location ? [{ label: t('location'), value: item.location }] : []),
      ]}
      summary={item.summary}
      description={item.description}
      highlights={item.highlights}
      highlightsTitle={tn('education')}
      links={item.url ? [{ href: item.url, label: t('links') }] : []}
    />
  )
}
