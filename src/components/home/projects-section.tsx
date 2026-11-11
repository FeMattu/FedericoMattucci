'use client'

import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import type { ProjectView } from '@/lib/content/view'
import { cn } from '@/lib/utils'

type Props = {
  projects: ProjectView[]
  tags: string[]
  /** Resolves an S3 key to a displayable URL (computed on the server). */
  coverUrls: Record<string, string>
}

export function ProjectsSection({ projects, tags, coverUrls }: Props) {
  const t = useTranslations('common')
  const tp = useTranslations('projects')
  const [tag, setTag] = useState<string | null>(null)
  const visible = tag ? projects.filter((p) => p.tags.includes(tag)) : projects

  return (
    <div>
      {tags.length > 1 && (
        <div role="group" aria-label={tp('filterByTag')} className="mb-6 flex flex-wrap gap-2">
          <Button size="sm" variant={tag === null ? 'default' : 'outline'} aria-pressed={tag === null} onClick={() => setTag(null)}>
            {t('all')}
          </Button>
          {tags.map((name) => (
            <Button
              key={name}
              size="sm"
              variant={tag === name ? 'default' : 'outline'}
              aria-pressed={tag === name}
              onClick={() => setTag(name)}
            >
              {name}
            </Button>
          ))}
        </div>
      )}

      <ul className="grid gap-5 sm:grid-cols-2">
        {visible.map((p) => {
          const cover = p.coverKey ? coverUrls[p.coverKey] : undefined
          return (
            <li key={p.id} className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/50">
              <Link href={`/projects/${p.slug}`} className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className={cn('aspect-[16/9] w-full bg-muted', !cover && 'flex items-center justify-center text-muted-foreground')}>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- signed CDN URL, sized by aspect box
                    <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <span className="text-sm">{p.title}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium leading-snug">{p.title}</h3>
                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
                  </div>
                  {p.summary && <p className="text-sm leading-relaxed text-muted-foreground">{p.summary}</p>}
                  {p.tags.length > 0 && (
                    <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {p.tags.map((name) => (
                        <li key={name}>
                          <Badge variant="secondary" className="font-normal">
                            {name}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
              {(p.liveUrl || p.repoUrl) && (
                <div className="flex gap-4 border-t px-5 py-3 text-sm">
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      {t('live')} <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  )}
                  {p.repoUrl && (
                    <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      {t('repo')} <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
