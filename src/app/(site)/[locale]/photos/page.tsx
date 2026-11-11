import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PhotoGallery } from '@/components/photos/photo-gallery'
import { locales } from '@/i18n/config'
import { getPhotosContent } from '@/lib/content/photos'

type Props = { params: Promise<{ locale: string }> }

export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'sections' })
  return {
    title: t('photos'),
    alternates: {
      canonical: `/${locale}/photos`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/photos`])),
    },
  }
}

export default async function PhotosPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, { photos, albums, tags }] = await Promise.all([
    getTranslations('sections'),
    getPhotosContent(locale),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl">{t('photos')}</h1>
      <PhotoGallery photos={photos} albums={albums} tags={tags} />
    </div>
  )
}
