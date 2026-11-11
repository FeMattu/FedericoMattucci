import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { DetailPage } from '@/components/detail/detail-page'
import { locales } from '@/i18n/config'
import { getProject, listSlugs } from '@/lib/content'
import { cdnUrls } from '@/lib/storage/cdn'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const { projects } = await listSlugs()
  return locales.flatMap((locale) => projects.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const item = await getProject(locale, slug)
  if (!item) return {}
  const description = item.summary || undefined
  return {
    title: item.title,
    description,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/projects/${slug}`])),
    },
    openGraph: { title: item.title, description, type: 'article' },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const [item, t, tn, tp] = await Promise.all([
    getProject(locale, slug),
    getTranslations('common'),
    getTranslations('nav'),
    getTranslations('projects'),
  ])
  if (!item) notFound()

  const urls = cdnUrls([item.coverKey, ...item.gallery])
  const images = [item.coverKey, ...item.gallery]
    .filter((key): key is string => !!key && key in urls)
    .map((key) => ({ url: urls[key] as string, alt: item.title }))

  return (
    <DetailPage
      backTo="projects"
      backLabel={tn('projects')}
      title={item.title}
      summary={item.summary}
      description={item.description}
      tags={item.tags}
      images={images}
      highlightsTitle={tp('goals')}
      links={[
        ...(item.liveUrl ? [{ href: item.liveUrl, label: t('live') }] : []),
        ...(item.repoUrl ? [{ href: item.repoUrl, label: t('repo') }] : []),
      ]}
    />
  )
}
