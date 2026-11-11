import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { PhotoView } from '@/lib/content/photo-view'

/** Home strip: featured photos (or the first few), linking to the full portfolio. */
export async function PhotosPreview({ photos }: { photos: PhotoView[] }) {
  const t = await getTranslations('common')
  const featured = photos.filter((p) => p.featured)
  const shown = (featured.length > 0 ? featured : photos).slice(0, 6)
  if (shown.length === 0) return null

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((photo) => (
          <li key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <Link href="/photos" className="block size-full" aria-label={photo.alt}>
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                placeholder={photo.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={photo.blurDataUrl ?? undefined}
                className="object-cover transition-transform duration-500 hover:scale-[1.03] motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/photos" className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        {t('viewAll')} <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}
