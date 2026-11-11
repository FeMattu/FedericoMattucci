import { SiteTextsForm } from '@/components/admin/site-texts-form'
import { getLocaleOptions } from '@/lib/admin/queries'
import { SITE_IMAGE_KEYS, SITE_TEXT_FIELDS } from '@/lib/admin/site-texts'
import { cdnUrls } from '@/lib/storage/cdn'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export const metadata = { title: 'Site texts' }

function asTextMap(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).filter(([, v]) => typeof v === 'string')) as Record<string, string>
}

export default async function SiteTextsPage() {
  await requireAdmin()
  const [rows, locales] = await Promise.all([prisma.siteText.findMany(), getLocaleOptions()])
  const byKey = new Map(rows.map((r) => [r.key, asTextMap(r.value)]))

  const items = SITE_TEXT_FIELDS.map((f) => {
    const value = byKey.get(f.key) ?? {}
    const storedKey = SITE_IMAGE_KEYS.includes(f.key) ? Object.values(value)[0] : undefined
    return {
      key: f.key,
      label: f.label,
      multiline: f.multiline,
      help: 'help' in f ? f.help : undefined,
      value,
      image: 'image' in f,
      previewUrl: storedKey ? cdnUrls([storedKey])[storedKey] : undefined,
    }
  })

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Site texts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hero, bio, interests and SEO text, in every language. Empty translations fall back to the default language.
        </p>
      </header>
      <SiteTextsForm items={items} locales={locales} />
    </div>
  )
}
