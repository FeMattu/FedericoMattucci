import { ExternalLink, Mail, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

type Social = { id: string; kind: string; label: string; url: string }

const icons: Record<string, ReactNode> = {
  email: <Mail className="size-4" aria-hidden />,
  phone: <Phone className="size-4" aria-hidden />,
}

export async function ContactSection({ socials, children }: { socials: Social[]; children?: ReactNode }) {
  const t = await getTranslations('contact')

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <p className="max-w-md leading-relaxed text-muted-foreground">{t('intro')}</p>
        <ul className="mt-6 space-y-3">
          {socials.map((s) => {
            const external = s.url.startsWith('http')
            return (
              <li key={s.id}>
                <a
                  href={s.url}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center gap-2 text-sm hover:text-primary hover:underline"
                >
                  {icons[s.kind] ?? <ExternalLink className="size-4" aria-hidden />}
                  {s.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
      {children}
    </div>
  )
}
