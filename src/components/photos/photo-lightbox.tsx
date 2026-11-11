'use client'

import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { PhotoView } from '@/lib/content/photo-view'
import { cameraName, formatTakenAt, shootingSettings } from '@/lib/photos/format'

type Props = {
  photos: PhotoView[]
  /** Index into `photos`; null = closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}

const SWIPE_THRESHOLD = 50

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  )
}

export function PhotoLightbox({ photos, index, onIndexChange, onClose }: Props) {
  const t = useTranslations('photos')
  const locale = useLocale()
  const [showInfo, setShowInfo] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const photo = index !== null ? photos[index] : undefined
  const total = photos.length

  const go = (delta: number) => {
    if (index === null || total === 0) return
    onIndexChange((index + delta + total) % total)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') go(-1)
    else if (event.key === 'ArrowRight') go(1)
    else if (event.key.toLowerCase() === 'i') setShowInfo((v) => !v)
  }

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
  }

  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current
    const end = event.changedTouches[0]
    touchStart.current = null
    if (!start || !end) return
    const dx = end.clientX - start.x
    const dy = end.clientY - start.y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
    else if (dy < -SWIPE_THRESHOLD) setShowInfo(true)
    else if (dy > SWIPE_THRESHOLD) setShowInfo(false)
  }

  const settings = photo ? shootingSettings(photo.exif) : []
  const camera = photo ? cameraName(photo.exif) : undefined
  const takenAt = photo ? formatTakenAt(photo.takenAt, locale) : undefined

  return (
    <Dialog open={photo !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={onKeyDown}
        className="h-dvh w-screen max-w-none gap-0 rounded-none border-0 bg-background p-0 sm:h-[92dvh] sm:max-w-6xl sm:rounded-xl sm:border"
      >
        <DialogTitle className="sr-only">{photo?.title || photo?.alt || t('photoAlt')}</DialogTitle>
        <DialogDescription className="sr-only">
          {photo ? t('counter', { current: (index ?? 0) + 1, total }) : ''}
        </DialogDescription>

        {photo && (
          <div className="grid h-full min-h-0 grid-rows-[1fr_auto] md:grid-cols-[1fr_20rem] md:grid-rows-1">
            <div
              className="relative min-h-0 bg-muted/40"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <Image
                key={photo.id}
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 70vw, 100vw"
                className="object-contain"
                priority
                placeholder={photo.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={photo.blurDataUrl ?? undefined}
              />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <span className="rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur">
                  {t('counter', { current: (index ?? 0) + 1, total })}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="md:hidden"
                    aria-label={t('info')}
                    aria-pressed={showInfo}
                    onClick={() => setShowInfo((v) => !v)}
                  >
                    <Info className="size-4" aria-hidden />
                  </Button>
                  <Button variant="secondary" size="icon" aria-label={t('close')} onClick={onClose}>
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>

              {total > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    aria-label={t('previous')}
                    onClick={() => go(-1)}
                  >
                    <ChevronLeft className="size-5" aria-hidden />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={t('next')}
                    onClick={() => go(1)}
                  >
                    <ChevronRight className="size-5" aria-hidden />
                  </Button>
                </>
              )}
            </div>

            {/* A labelled region, not <aside>: the public site never has a sidebar element. */}
            <div
              role="region"
              aria-label={t('details')}
              className={`${showInfo ? 'block' : 'hidden'} max-h-[40dvh] overflow-y-auto border-t p-5 md:block md:max-h-none md:border-l md:border-t-0`}
            >
              {photo.title && <h2 className="text-lg font-medium leading-snug">{photo.title}</h2>}
              {photo.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{photo.description}</p>
              )}
              <dl className="mt-5 space-y-4">
                {takenAt && <Row label={t('date')}>{takenAt}</Row>}
                {photo.place && <Row label={t('place')}>{photo.place}</Row>}
                {camera && <Row label={t('camera')}>{camera}</Row>}
                {photo.exif.lensModel && <Row label={t('lens')}>{photo.exif.lensModel}</Row>}
                {settings.length > 0 && <Row label={t('settings')}>{settings.join(' · ')}</Row>}
                <Row label={t('dimensions')}>
                  {photo.width} × {photo.height}
                </Row>
              </dl>
              {photo.tags.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {photo.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="secondary" className="font-normal">
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
