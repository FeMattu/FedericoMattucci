import { ArrowLeft, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'

type DetailLink = { href: string; label: string }

type Props = {
  /** Home anchor to return to, e.g. "experience". */
  backTo: string
  backLabel: string
  title: string
  subtitle?: string
  meta?: { label: string; value: string }[]
  summary?: string
  description?: string
  highlightsTitle?: string
  highlights?: string[]
  tagsTitle?: string
  tags?: string[]
  links?: DetailLink[]
  images?: { url: string; alt: string }[]
}

/** Shared full-page layout for experience, education and project details. */
export async function DetailPage(props: Props) {
  const t = await getTranslations('common')
  const { title, subtitle, meta = [], summary, description, highlights = [], tags = [], links = [], images = [] } = props

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <Link
        href={`/#${props.backTo}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {props.backLabel}
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>}
      </header>

      {meta.length > 0 && (
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
          {meta.map((m) => (
            <div key={m.label} className="contents">
              <dt className="text-muted-foreground">{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {summary && <p className="mt-8 text-lg leading-relaxed">{summary}</p>}
      {description && (
        <div className="mt-6 space-y-4 leading-relaxed text-foreground/90">
          {description.split(/\n{2,}/).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}

      {highlights.length > 0 && (
        <section className="mt-10" aria-labelledby="highlights-title">
          <h2 id="highlights-title" className="mb-3 text-sm font-medium text-muted-foreground">
            {props.highlightsTitle ?? t('responsibilities')}
          </h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed marker:text-primary">
            {highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      )}

      {tags.length > 0 && (
        <section className="mt-10" aria-labelledby="tags-title">
          <h2 id="tags-title" className="mb-3 text-sm font-medium text-muted-foreground">
            {props.tagsTitle ?? t('technologies')}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag}>
                <Badge variant="secondary" className="px-3 py-1 font-normal">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {images.length > 0 && (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <li key={img.url} className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-muted">
              <Image src={img.url} alt={img.alt} fill sizes="(min-width: 768px) 384px, 100vw" className="object-cover" />
            </li>
          ))}
        </ul>
      )}

      {links.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-5 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {l.label} <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
