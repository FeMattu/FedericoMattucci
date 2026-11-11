'use client'

import { useId, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { saveSiteText } from '@/actions/admin-site'
import { LocalizedField, type LocaleOption } from '@/components/admin/fields'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/lib/admin/messages'
import type { FieldDef } from '@/lib/admin/resources'

type Item = { key: string; label: string; multiline: boolean; help?: string; value: Record<string, string> }

function TextBlock({ item, locales }: { item: Item; locales: LocaleOption[] }) {
  const id = useId()
  const [value, setValue] = useState<Record<string, string | string[] | undefined>>(item.value)
  const [pending, startTransition] = useTransition()

  const field: FieldDef = {
    name: item.key,
    label: item.label,
    type: item.multiline ? 'localizedArea' : 'localized',
    help: item.help,
  }

  const save = () =>
    startTransition(async () => {
      const text = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeof v === 'string' ? v : '']))
      const result = await saveSiteText(item.key, text)
      if (result.ok) toast.success(`${item.label} saved`)
      else toast.error(errorMessage(result.error))
    })

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <LocalizedField id={id} field={field} locales={locales} value={value} onChange={setValue} />
      <Button type="button" size="sm" onClick={save} disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </Button>
    </section>
  )
}

export function SiteTextsForm({ items, locales }: { items: Item[]; locales: LocaleOption[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <TextBlock key={item.key} item={item} locales={locales} />
      ))}
    </div>
  )
}
