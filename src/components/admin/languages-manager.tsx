'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addLocale, setLocaleEnabled } from '@/actions/admin-site'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { errorMessage } from '@/lib/admin/messages'

type Row = { code: string; name: string; isDefault: boolean; enabled: boolean; missing: number; hasUiMessages: boolean }

export function LanguagesManager({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const uid = useId()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [pending, startTransition] = useTransition()

  const toggle = (row: Row, enabled: boolean) =>
    startTransition(async () => {
      const result = await setLocaleEnabled(row.code, enabled)
      if (!result.ok) toast.error(errorMessage(result.error))
      else router.refresh()
    })

  const add = (event: React.FormEvent) => {
    event.preventDefault()
    startTransition(async () => {
      const result = await addLocale(code.trim(), name.trim())
      if (!result.ok) {
        toast.error(result.error === 'validation' ? 'Use a language code like "fr" or "pt-BR" and a name.' : errorMessage(result.error))
        return
      }
      toast.success(`${name.trim()} added`)
      setCode('')
      setName('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <caption className="sr-only">Content languages</caption>
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th scope="col" className="p-3 font-medium">Language</th>
              <th scope="col" className="p-3 font-medium">Missing translations</th>
              <th scope="col" className="p-3 font-medium">Interface</th>
              <th scope="col" className="p-3 font-medium">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} className="border-b last:border-0">
                <th scope="row" className="p-3 text-left font-normal">
                  {row.name} <span className="text-muted-foreground">({row.code})</span>
                  {row.isDefault && <Badge className="ml-2">Default</Badge>}
                </th>
                <td className="p-3">
                  {row.isDefault ? (
                    <span className="text-muted-foreground">Source language</span>
                  ) : row.missing === 0 ? (
                    <span>Complete</span>
                  ) : (
                    <Badge variant="secondary">{row.missing} to translate</Badge>
                  )}
                </td>
                <td className="p-3">
                  {row.hasUiMessages ? 'Translated' : <span className="text-muted-foreground">Needs messages file</span>}
                </td>
                <td className="p-3">
                  <Switch
                    checked={row.enabled}
                    disabled={row.isDefault || pending}
                    onCheckedChange={(on) => toggle(row, on)}
                    aria-label={`${row.name} enabled`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className="space-y-3 rounded-lg border p-4" aria-label="Add a language">
        <h2 className="font-medium">Add a language</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${uid}-code`}>Code</Label>
            <Input id={`${uid}-code`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="fr" className="w-28" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${uid}-name`}>Name</Label>
            <Input id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Français" className="w-48" required />
          </div>
          <Button type="submit" disabled={pending}>
            Add language
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Adding a language here lets you translate all content from the editors. To also serve the public site at
          <code className="mx-1 rounded bg-muted px-1">/{code || 'fr'}</code>
          add <code className="rounded bg-muted px-1">src/i18n/messages/{code || 'fr'}.json</code> and one line in{' '}
          <code className="rounded bg-muted px-1">src/i18n/config.ts</code>, then deploy.
        </p>
      </form>
    </div>
  )
}
