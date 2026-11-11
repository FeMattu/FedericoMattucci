'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { saveItem } from '@/actions/admin'
import { FieldRow, ImageField, LocalizedField, TagsField, type LocaleOption } from '@/components/admin/fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { errorMessage } from '@/lib/admin/messages'
import type { FieldDef, ResourceDef } from '@/lib/admin/resources'

type Values = Record<string, unknown>
type Option = { value: string; label: string }

type Props = {
  def: ResourceDef
  /** null = creating a new item. */
  id: string | null
  initial: Values
  locales: LocaleOption[]
  options: Record<string, Option[]>
  /** key -> signed URL for image fields. */
  previews?: Record<string, string>
}

export function ResourceForm({ def, id, initial, locales, options, previews = {} }: Props) {
  const router = useRouter()
  const uid = useId()
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    startTransition(async () => {
      const result = await saveItem(def.key, id, values)
      if (result.ok) {
        toast.success(id ? 'Saved' : `${def.singular} created`)
        setErrors({})
        router.push(`/admin/${def.key}`)
        router.refresh()
        return
      }
      setErrors(result.fieldErrors ?? {})
      toast.error(errorMessage(result.error))
    })
  }

  const render = (field: FieldDef) => {
    const fid = `${uid}-${field.name}`
    const error = errors[field.name]
    const value = values[field.name]

    switch (field.type) {
      case 'localized':
      case 'localizedArea':
      case 'localizedList':
        return (
          <LocalizedField
            key={field.name}
            id={fid}
            field={field}
            locales={locales}
            value={(value as Record<string, string | string[]>) ?? {}}
            onChange={(next) => set(field.name, next)}
            error={error}
          />
        )
      case 'tags':
        return (
          <TagsField key={field.name} id={fid} field={field} value={(value as string[]) ?? []} onChange={(n) => set(field.name, n)} error={error} />
        )
      case 'image':
        return (
          <ImageField
            key={field.name}
            id={fid}
            field={field}
            value={(value as string) ?? ''}
            previewUrl={previews[field.name]}
            onChange={(key) => set(field.name, key)}
            error={error}
          />
        )
      case 'textarea':
        return (
          <FieldRow key={field.name} id={fid} field={field} error={error}>
            <Textarea id={fid} rows={5} value={(value as string) ?? ''} onChange={(e) => set(field.name, e.target.value)} aria-invalid={!!error} />
          </FieldRow>
        )
      case 'select': {
        const list = options[field.optionsKey ?? ''] ?? []
        return (
          <FieldRow key={field.name} id={fid} field={field} error={error}>
            <select
              id={fid}
              value={(value as string) ?? ''}
              onChange={(e) => set(field.name, e.target.value)}
              aria-invalid={!!error}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {!field.required && <option value="">None</option>}
              {field.required && <option value="" disabled>Choose…</option>}
              {list.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FieldRow>
        )
      }
      case 'number':
        return (
          <FieldRow key={field.name} id={fid} field={field} error={error}>
            <Input
              id={fid}
              type="number"
              min={field.min}
              max={field.max}
              step={1}
              value={typeof value === 'number' ? value : ''}
              onChange={(e) => set(field.name, e.target.value === '' ? '' : Number(e.target.value))}
              aria-invalid={!!error}
            />
          </FieldRow>
        )
      case 'date':
        return (
          <FieldRow key={field.name} id={fid} field={field} error={error}>
            <Input id={fid} type="date" value={(value as string) ?? ''} onChange={(e) => set(field.name, e.target.value)} aria-invalid={!!error} />
          </FieldRow>
        )
      default:
        return (
          <FieldRow key={field.name} id={fid} field={field} error={error}>
            <Input
              id={fid}
              type={field.type === 'url' ? 'text' : 'text'}
              inputMode={field.type === 'url' ? 'url' : undefined}
              value={(value as string) ?? ''}
              onChange={(e) => set(field.name, e.target.value)}
              aria-invalid={!!error}
            />
          </FieldRow>
        )
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6" aria-label={`${id ? 'Edit' : 'New'} ${def.singular.toLowerCase()}`}>
      {def.fields.map(render)}

      {(def.hasStatus || def.hasFeatured) && (
        <div className="flex flex-wrap gap-8 rounded-lg border p-4">
          {def.hasStatus && (
            <div className="flex items-center gap-3">
              <Switch
                id={`${uid}-status`}
                checked={values.status !== 'DRAFT'}
                onCheckedChange={(on) => set('status', on ? 'PUBLISHED' : 'DRAFT')}
              />
              <Label htmlFor={`${uid}-status`}>Published</Label>
            </div>
          )}
          {def.hasFeatured && (
            <div className="flex items-center gap-3">
              <Switch id={`${uid}-featured`} checked={values.featured === true} onCheckedChange={(on) => set('featured', on)} />
              <Label htmlFor={`${uid}-featured`}>Featured</Label>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : id ? 'Save changes' : `Create ${def.singular.toLowerCase()}`}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/admin/${def.key}`)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
