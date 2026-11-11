'use client'

import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState } from 'react'
import { registerPhoto } from '@/actions/uploads'
import { uploadToStorage } from '@/components/admin/upload-client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { errorMessage } from '@/lib/admin/messages'

type Upload = { id: number; name: string; state: 'uploading' | 'processing' | 'done' | 'error'; message?: string }

/** Multi-file photo upload: browser -> S3, then the server reads size/EXIF and creates the photo. */
export function PhotoManager({ albums }: { albums: { value: string; label: string }[] }) {
  const router = useRouter()
  const albumId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [album, setAlbum] = useState('')
  const [uploads, setUploads] = useState<Upload[]>([])
  const [busy, setBusy] = useState(false)

  const update = (id: number, patch: Partial<Upload>) =>
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)))

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    const batch = Array.from(files).map((file, i) => ({ file, id: Date.now() + i }))
    setUploads((list) => [...batch.map((b) => ({ id: b.id, name: b.file.name, state: 'uploading' as const })), ...list])

    for (const { file, id } of batch) {
      const uploaded = await uploadToStorage(file, 'photo')
      if (!uploaded.ok) {
        update(id, { state: 'error', message: uploaded.error })
        continue
      }
      update(id, { state: 'processing' })
      const registered = await registerPhoto(uploaded.key, album || undefined)
      if (registered.ok) update(id, { state: 'done' })
      else update(id, { state: 'error', message: errorMessage(registered.error) })
    }
    setBusy(false)
    router.refresh()
  }

  return (
    <section aria-labelledby="upload-title" className="space-y-4 rounded-lg border p-4">
      <h2 id="upload-title" className="font-medium">
        Add photos
      </h2>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={albumId}>Album (optional)</Label>
          <select
            id={albumId}
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            className="h-9 min-w-48 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">No album</option>
            {albums.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <input
          ref={input}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          aria-label="Choose photos to upload"
          onChange={(e) => {
            void onFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Button type="button" disabled={busy} onClick={() => input.current?.click()}>
          <Upload className="size-4" aria-hidden />
          {busy ? 'Uploading…' : 'Choose photos'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP or AVIF, up to 25 MB each. Size, EXIF and the blur placeholder are read automatically; images
        larger than 3200 px are downscaled.
      </p>

      {uploads.length > 0 && (
        <ul className="space-y-1.5 text-sm" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.id} className="flex items-center gap-2">
              {u.state === 'done' && <CheckCircle2 className="size-4 text-primary" aria-hidden />}
              {u.state === 'error' && <AlertCircle className="size-4 text-destructive" aria-hidden />}
              {(u.state === 'uploading' || u.state === 'processing') && <Loader2 className="size-4 animate-spin" aria-hidden />}
              <span className="truncate">{u.name}</span>
              <span className="text-muted-foreground">
                {u.state === 'uploading' && 'Uploading…'}
                {u.state === 'processing' && 'Processing…'}
                {u.state === 'done' && 'Added'}
                {u.state === 'error' && u.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
