import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type Props = {
  href: string
  period: string
  title: string
  subtitle: string
  summary?: string
  tags?: string[]
  current?: boolean
}

/** Compact, clickable card used for experience and education entries. */
export function TimelineCard({ href, period, title, subtitle, summary, tags = [], current }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-xl border bg-card p-5 transition-colors',
        'hover:border-primary/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {period}
            {current && <span className="ml-2 inline-block size-1.5 rounded-full bg-primary align-middle" aria-hidden />}
          </p>
          <h3 className="mt-1 font-medium leading-snug">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <ArrowUpRight
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden
        />
      </div>
      {summary && <p className="mt-3 text-sm leading-relaxed text-foreground/80">{summary}</p>}
      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="tags">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" className="font-normal">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Link>
  )
}
