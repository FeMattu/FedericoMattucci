'use server'

import { randomUUID } from 'node:crypto'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Prisma } from '@prisma/client'
import { env } from '@/env'
import { UnauthorizedError, assertAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { revalidateSite } from '@/lib/revalidate'
import { processImage } from '@/lib/uploads/process'
import { MAX_UPLOAD_BYTES, buildObjectKey, isPhotoKey, validateUploadRequest } from '@/lib/uploads/validate'
import type { ActionResult } from './admin'

const PRESIGN_SECONDS = 300

function storage() {
  const e = env('storage')
  return {
    bucket: e.AWS_S3_BUCKET,
    client: new S3Client({
      region: e.AWS_REGION,
      credentials: { accessKeyId: e.AWS_ACCESS_KEY_ID, secretAccessKey: e.AWS_SECRET_ACCESS_KEY },
    }),
  }
}

async function authorize(): Promise<ActionResult<never> | null> {
  try {
    await assertAdmin()
    return null
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: 'unauthorized' }
    throw error
  }
}

/**
 * Step 1 of an upload: the admin's browser asks for a short-lived presigned PUT
 * URL. Type and size are validated here; the key is generated here, so the
 * browser never chooses where in the bucket it writes.
 */
export async function requestUpload(input: unknown): Promise<ActionResult<{ url: string; key: string; contentType: string }>> {
  const denied = await authorize()
  if (denied) return denied
  const parsed = validateUploadRequest(input)
  if (!parsed.ok) return { ok: false, error: 'validation' }

  try {
    const { client, bucket } = storage()
    const key = buildObjectKey(parsed.data, new Date(), randomUUID())
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: parsed.data.contentType }),
      { expiresIn: PRESIGN_SECONDS },
    )
    return { ok: true, data: { url, key, contentType: parsed.data.contentType } }
  } catch (error) {
    console.error('requestUpload failed', error instanceof Error ? error.message : error)
    return { ok: false, error: 'failed' }
  }
}

/**
 * Step 2 (photos): after the browser finished the PUT, read the object,
 * extract size/EXIF, build the blur placeholder, downscale if oversized and
 * create the Photo row.
 */
export async function registerPhoto(key: unknown, albumId?: unknown): Promise<ActionResult<{ id: string }>> {
  const denied = await authorize()
  if (denied) return denied
  if (!isPhotoKey(key) || (albumId !== undefined && albumId !== null && typeof albumId !== 'string')) {
    return { ok: false, error: 'validation' }
  }

  try {
    const { client, bucket } = storage()
    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    if (!object.Body || (object.ContentLength ?? 0) > MAX_UPLOAD_BYTES) return { ok: false, error: 'validation' }
    const bytes = Buffer.from(await object.Body.transformToByteArray())

    let processed
    try {
      processed = await processImage(bytes)
    } catch {
      return { ok: false, error: 'validation' }
    }
    if (processed.resized) {
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: processed.buffer, ContentType: object.ContentType }),
      )
    }

    const last = await prisma.photo.findFirst({ orderBy: { position: 'desc' }, select: { position: true } })
    const photo = await prisma.photo.create({
      data: {
        key,
        albumId: typeof albumId === 'string' && albumId !== '' ? albumId : null,
        width: processed.width,
        height: processed.height,
        blurDataUrl: processed.blurDataUrl,
        takenAt: processed.takenAt,
        exif: processed.exif ?? undefined,
        position: (last?.position ?? -1) + 1,
        status: 'PUBLISHED',
      },
    })
    revalidateSite()
    return { ok: true, data: { id: photo.id } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { ok: false, error: 'conflict' }
    }
    console.error('registerPhoto failed', error instanceof Error ? error.message : error)
    return { ok: false, error: 'failed' }
  }
}
