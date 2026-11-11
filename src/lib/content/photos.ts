import 'server-only'
import { getTranslations } from 'next-intl/server'
import { cache } from 'react'
import { photosRepository as repo } from '@/lib/db/repositories/photos'
import { cdnUrls } from '@/lib/storage/cdn'
import { toAlbumViews, toPhotoView } from './photo-view'

/** All published photos (signed URLs), albums with counts and the tag list, localized. */
export const getPhotosContent = cache(async (locale: string) => {
  const [t, rows, albumRows] = await Promise.all([
    getTranslations({ locale, namespace: 'photos' }),
    repo.photos(),
    repo.albums(),
  ])
  const urls = cdnUrls(rows.map((r) => r.key))
  const photos = rows
    .filter((r) => r.key in urls)
    .map((r) => toPhotoView(r, urls[r.key] as string, locale, t('photoAlt')))

  return {
    photos,
    albums: toAlbumViews(albumRows, photos, locale),
    tags: [...new Set(photos.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b)),
  }
})

export type PhotosContent = Awaited<ReturnType<typeof getPhotosContent>>

export async function hasPhotos(): Promise<boolean> {
  return (await repo.photos()).length > 0
}
