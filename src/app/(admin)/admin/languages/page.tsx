import { LanguagesManager } from '@/components/admin/languages-manager'
import { locales as uiLocales } from '@/i18n/config'
import { RESOURCES, RESOURCE_KEYS } from '@/lib/admin/resources'
import { SITE_TEXT_FIELDS } from '@/lib/admin/site-texts'
import { missingTranslations, sumCounts } from '@/lib/admin/translation-status'
import { requireAdmin } from '@/lib/auth/session'
import { adminRepository as repo } from '@/lib/db/repositories/admin'
import { prisma } from '@/lib/db/prisma'

export const metadata = { title: 'Languages' }

export default async function LanguagesPage() {
  await requireAdmin()
  const [locales, defaultLocale, siteTexts] = await Promise.all([repo.locales(), repo.defaultLocale(), prisma.siteText.findMany()])
  const codes = locales.map((l) => l.code)

  const perResource = await Promise.all(
    RESOURCE_KEYS.map(async (key) => missingTranslations(RESOURCES[key], await repo.list(key), codes, defaultLocale)),
  )
  // Site texts are keyed rows holding one translatable value each.
  const siteMissing = missingTranslations(
    { ...RESOURCES.experience, fields: [{ name: 'value', label: 'value', type: 'localized' }] },
    siteTexts.filter((t) => SITE_TEXT_FIELDS.some((f) => f.key === t.key)),
    codes,
    defaultLocale,
  )
  const missing = sumCounts([...perResource, siteMissing])

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Languages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Content is written in the default language and translated per language. Anything not translated yet falls
          back to the default language on the public site.
        </p>
      </header>
      <LanguagesManager
        rows={locales.map((l) => ({
          code: l.code,
          name: l.name,
          isDefault: l.isDefault,
          enabled: l.enabled,
          missing: missing[l.code] ?? 0,
          hasUiMessages: (uiLocales as readonly string[]).includes(l.code),
        }))}
      />
    </div>
  )
}
