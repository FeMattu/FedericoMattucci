'use client'

import { ImageIcon, Upload, X } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { uploadToStorage } from '@/components/admin/upload-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { FieldDef } from '@/lib/admin/resources'
import { fieldErrorText } from '@/lib/admin/messages'
import type { UploadPurpose } from '@/lib/uploads/validate'

export type LocaleOption = { code: string; name: string; isDefault: boolean }

/** Label + control + help + error, wired for assistive tech. */
export function FieldRow({
  id,
  field,
  error,
  children,
}: {
  id: string
  field: FieldDef
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span aria-hidden className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {field.help && !error && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {fieldErrorText(error)}
        </p>
      )}
    </div>
  )
}

type LocalizedValue = Record<string, string | string[] | undefined>

const isEmpty = (v: string | string[] | undefined) => (Array.isArray(v) ? v.length === 0 : !v || v.trim() === '')

/** One tab per language; a dot marks languages that have no text yet. */
export function LocalizedField({
  id,
  field,
  locales,
  value,
  onChange,
  error,
}: {
  id: string
  field: FieldDef
  locales: LocaleOption[]
  value: LocalizedValue
  onChange: (next: LocalizedValue) => void
  error?: string
}) {
  const first = locales[0]?.code ?? 'en'
  const [active, setActive] = useState(first)
  const isList = field.type === 'localizedList'

  const set = (code: string, next: string | string[]) => onChange({ ...value, [code]: next })

  return (
    <FieldRow id={id} field={field} error={error}>
      <Tabs value={active} onValueChange={setActive}>
        <TabsList>
          {locales.map((l) => (
            <TabsTrigger key={l.code} value={l.code}>
              {l.name}
              {l.isDefault && <span className="sr-only"> (default)</span>}
              {isEmpty(value[l.code]) && (
                <span
                  role="img"
                  aria-label="no translation yet"
                  className={`ml-1.5 inline-block size-1.5 rounded-full ${l.isDefault && field.required ? 'bg-destructive' : 'bg-amber-500'}`}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {locales.map((l) => {
          const current = value[l.code]
          return (
            <TabsContent key={l.code} value={l.code} className="mt-2">
              {field.type === 'localized' ? (
                <Input
                  id={l.code === active ? id : undefined}
                  lang={l.code}
                  value={typeof current === 'string' ? current : ''}
                  onChange={(e) => set(l.code, e.target.value)}
                  aria-invalid={!!error}
                />
              ) : (
                <Textarea
                  id={l.code === active ? id : undefined}
                  lang={l.code}
                  rows={isList ? 6 : 5}
                  value={isList ? (Array.isArray(current) ? current.join('\n') : '') : typeof current === 'string' ? current : ''}
                  onChange={(e) => set(l.code, isList ? e.target.value.split('\n') : e.target.value)}
                  aria-invalid={!!error}
                />
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </FieldRow>
  )
}

export function TagsField({
  id,
  field,
  value,
  onChange,
  error,
}: {
  id: string
  field: FieldDef
  value: string[]
  onChange: (next: string[]) => void
  error?: string
}) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const tag = draft.trim().replace(/,$/, '').trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <FieldRow id={id} field={{ ...field, help: field.help ?? 'Press Enter or comma to add.' }} error={error}>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" className="gap-1 font-normal">
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  className="rounded-sm hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onChange(value.filter((t) => t !== tag))}
                >
                  <X className="size-3" aria-hidden />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} onBlur={commit} />
    </FieldRow>
  )
}

export function ImageField({
  id,
  field,
  value,
  previewUrl,
  purpose = 'project',
  onChange,
  error,
}: {
  id: string
  field: FieldDef
  value: string
  /** Signed URL of the stored image (computed on the server). */
  previewUrl?: string
  /** Where uploads go in the bucket. */
  purpose?: UploadPurpose
  onChange: (key: string) => void
  error?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const helpId = useId()
  const [busy, setBusy] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | undefined>()

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    const result = await uploadToStorage(file, purpose)
    setBusy(false)
    if (!result.ok) return void toast.error(result.error)
    setLocalPreview(URL.createObjectURL(file))
    onChange(result.key)
    toast.success('Image uploaded. Save to apply it.')
  }

  const shown = localPreview ?? (value ? previewUrl : undefined)

  return (
    <FieldRow id={id} field={field} error={error}>
      <div className="flex items-center gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob or signed CDN URL
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={input}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            aria-describedby={helpId}
            onChange={(e) => {
              void onFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
              <Upload className="size-4" aria-hidden />
              {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalPreview(undefined)
                  onChange('')
                }}
              >
                Remove
              </Button>
            )}
          </div>
          <p id={helpId} className="text-xs text-muted-foreground">
            JPEG, PNG, WebP or AVIF, up to 25 MB.
          </p>
        </div>
      </div>
    </FieldRow>
  )
}
