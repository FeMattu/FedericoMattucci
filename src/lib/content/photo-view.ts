import { localize } from '@/lib/i18n/localized'
import type { PhotoExif } from '@/lib/photos/metadata'

/** Photos without stored dimensions (no sidecar) fall back to a 3:2 box. */
export const DEFAULT_PHOTO_SIZE = { width: 1600, height: 1067 }

type PhotoRow = {
  id: string
  key: string
  albumId: string | null
  title: unknown
  description: unknown
  alt: unknown
  place: string | null
  takenAt: Date | null
  width: number | null
  height: number | null
  blurDataUrl: string | null
  exif: unknown
  tags: string[]
  featured: boolean
}

export type PhotoView = {
  id: string
  url: string
  width: number
  height: number
  blurDataUrl: string | null
  title: string
  description: string
  alt: string
  place: string | null
  takenAt: string | null
  exif: PhotoExif
  tags: string[]
  albumId: string | null
  featured: boolean
}

function asExif(value: unknown): PhotoExif {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as PhotoExif) : {}
}

/** `url` is the already-signed CDN URL for `row.key` (signing is a server concern). */
export function toPhotoView(row: PhotoRow, url: string, locale: string, fallbackAlt: string): PhotoView {
  const title = localize(row.title, locale)
  return {
    id: row.id,
    url,
    width: row.width ?? DEFAULT_PHOTO_SIZE.width,
    height: row.height ?? DEFAULT_PHOTO_SIZE.height,
    blurDataUrl: row.blurDataUrl,
    title,
    description: localize(row.description, locale),
    alt: localize(row.alt, locale) || title || fallbackAlt,
    place: row.place,
    takenAt: row.takenAt ? row.takenAt.toISOString() : null,
    exif: asExif(row.exif),
    tags: row.tags,
    albumId: row.albumId,
    featured: row.featured,
  }
}

type AlbumRow = { id: string; slug: string; title: unknown }
export type AlbumView = { id: string; slug: string; title: string; count: number }

/** Albums that contain at least one of the given photos, with their photo counts. */
export function toAlbumViews(albums: AlbumRow[], photos: { albumId: string | null }[], locale: string): AlbumView[] {
  return albums
    .map((a) => ({
      id: a.id,
      slug: a.slug,
      title: localize(a.title, locale) || a.slug,
      count: photos.filter((p) => p.albumId === a.id).length,
    }))
    .filter((a) => a.count > 0)
}
