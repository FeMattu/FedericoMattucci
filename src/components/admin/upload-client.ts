import { requestUpload } from '@/actions/uploads'
import { errorMessage } from '@/lib/admin/messages'
import type { UploadPurpose } from '@/lib/uploads/validate'

export type UploadOutcome = { ok: true; key: string } | { ok: false; error: string }

/** Browser -> S3 with a presigned URL (type/size checked server-side first). */
export async function uploadToStorage(file: File, purpose: UploadPurpose): Promise<UploadOutcome> {
  const request = await requestUpload({
    purpose,
    filename: file.name,
    contentType: file.type,
    size: file.size,
  })
  if (!request.ok) {
    return {
      ok: false,
      error:
        request.error === 'validation'
          ? 'Use a JPEG, PNG, WebP or AVIF image up to 25 MB.'
          : errorMessage(request.error),
    }
  }

  try {
    const response = await fetch(request.data.url, {
      method: 'PUT',
      headers: { 'Content-Type': request.data.contentType },
      body: file,
    })
    if (!response.ok) {
      return { ok: false, error: `Upload failed (${response.status}). Check the bucket's CORS settings.` }
    }
  } catch {
    return { ok: false, error: 'Upload failed. Check your connection and the bucket CORS settings.' }
  }
  return { ok: true, key: request.data.key }
}
