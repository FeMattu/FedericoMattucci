'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { PhotoLightbox } from '@/components/photos/photo-lightbox'
import { Button } from '@/components/ui/button'
import type { AlbumView, PhotoView } from '@/lib/content/photo-view'

type Props = { photos: PhotoView[]; albums: AlbumView[]; tags: string[] }

export function PhotoGallery({ photos, albums, tags }: Props) {
  const t = useTranslations('photos')
  const tc = useTranslations('common')
  const [albumId, setAlbumId] = useState<string | null>(null)
  const [tag, setTag] = useState<string | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const visible = useMemo(
    () => photos.filter((p) => (!albumId || p.albumId === albumId) && (!tag || p.tags.includes(tag))),
    [photos, albumId, tag],
  )

  if (photos.length === 0) return <p className="text-muted-foreground">{t('empty')}</p>

  return (
    <div>
      {(albums.length > 0 || tags.length > 0) && (
        <div className="mb-8 space-y-3">
          {albums.length > 0 && (
            <div role="group" aria-label={t('filterByAlbum')} className="flex flex-wrap gap-2">
              <Button size="sm" variant={albumId === null ? 'default' : 'outline'} aria-pressed={albumId === null} onClick={() => setAlbumId(null)}>
                {t('allPhotos')}
              </Button>
              {albums.map((a) => (
                <Button
                  key={a.id}
                  size="sm"
                  variant={albumId === a.id ? 'default' : 'outline'}
                  aria-pressed={albumId === a.id}
                  onClick={() => setAlbumId(a.id)}
                >
                  {a.title} <span className="text-xs opacity-70">{a.count}</span>
                </Button>
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <div role="group" aria-label={t('filterByTag')} className="flex flex-wrap gap-2">
              <Button size="sm" variant={tag === null ? 'secondary' : 'ghost'} aria-pressed={tag === null} onClick={() => setTag(null)}>
                {tc('all')}
              </Button>
              {tags.map((name) => (
                <Button key={name} size="sm" variant={tag === name ? 'secondary' : 'ghost'} aria-pressed={tag === name} onClick={() => setTag(name)}>
                  {name}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CSS columns = masonry without JS or layout shift (every image has width/height). */}
      <ul className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {visible.map((photo, i) => (
          <li key={photo.id} className="mb-3 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`${t('open')}: ${photo.alt}`}
              className="group block w-full overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src={photo.url}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                placeholder={photo.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={photo.blurDataUrl ?? undefined}
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
              />
            </button>
          </li>
        ))}
      </ul>

      <PhotoLightbox photos={visible} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </div>
  )
}
