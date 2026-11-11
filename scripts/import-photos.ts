/**
 * Imports the existing S3 photo library into the database.
 *
 *   npm run photos:import -- [--prefix portfolio] [--dry]
 *
 * - Lists image keys under the prefix and reads the `<name>.json` sidecar
 *   written by the upload Lambda (size, blur placeholder, EXIF).
 * - Create-only: photos already in the DB are left untouched, so edits made
 *   from the admin are never overwritten. Safe to re-run.
 * - A sub-folder under the prefix becomes an album.
 * Needs the AWS_* and CLOUDFRONT_* variables (.env.local) and DATABASE_URL.
 */
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { PrismaClient, type Prisma } from '@prisma/client'
import { albumSlugFromKey, compactExif, parseSidecar } from '../src/lib/photos/metadata'
import { isSafeKey, normalizePrivateKey, resourceUrl, signedUrlExpiry } from '../src/lib/storage/signing'

const IMAGE = /\.(jpe?g|png|webp|avif)$/i

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const humanize = (slug: string) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

async function listKeys(s3: S3Client, bucket: string, prefix: string): Promise<string[]> {
  const keys: string[] = []
  let token: string | undefined
  do {
    const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }))
    for (const item of page.Contents ?? []) if (item.Key && IMAGE.test(item.Key)) keys.push(item.Key)
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return keys
}

async function main() {
  const prefix = (arg('prefix') ?? 'portfolio').replace(/\/+$/, '')
  const dry = process.argv.includes('--dry')

  const s3 = new S3Client({
    region: required('AWS_REGION'),
    credentials: { accessKeyId: required('AWS_ACCESS_KEY_ID'), secretAccessKey: required('AWS_SECRET_ACCESS_KEY') },
  })
  const cdn = required('CLOUDFRONT_URL')
  const keyPairId = required('CLOUDFRONT_KEY_PAIR_ID')
  const privateKey = normalizePrivateKey(required('CLOUDFRONT_PRIVATE_KEY'))
  const sign = (key: string) =>
    getSignedUrl({ url: resourceUrl(cdn, key), keyPairId, privateKey, dateLessThan: signedUrlExpiry(new Date(), 1) })

  const keys = (await listKeys(s3, required('AWS_S3_BUCKET'), prefix)).filter(isSafeKey)
  console.log(`Found ${keys.length} image(s) under "${prefix}/"`)

  const prisma = new PrismaClient()
  try {
    const known = new Set((await prisma.photo.findMany({ select: { key: true } })).map((p) => p.key))
    const fresh = keys.filter((k) => !known.has(k))
    console.log(`${fresh.length} new, ${keys.length - fresh.length} already imported`)
    if (dry) return

    const rows: { key: string; takenAt?: Date; data: Prisma.PhotoUncheckedCreateInput }[] = []
    for (const key of fresh) {
      let sidecar = parseSidecar(null)
      try {
        const res = await fetch(sign(key.replace(/\.[^/.]+$/, '.json')))
        if (res.ok) sidecar = parseSidecar(await res.json())
        else console.warn(`  no sidecar for ${key} (${res.status})`)
      } catch (error) {
        console.warn(`  sidecar failed for ${key}:`, error instanceof Error ? error.message : error)
      }

      let albumId: string | null = null
      const albumSlug = albumSlugFromKey(key, prefix)
      if (albumSlug) {
        const title = { it: humanize(albumSlug), en: humanize(albumSlug) }
        const album = await prisma.album.upsert({
          where: { slug: albumSlug },
          update: {},
          create: { slug: albumSlug, title },
        })
        albumId = album.id
      }

      rows.push({
        key,
        takenAt: sidecar.takenAt,
        data: {
          key,
          albumId,
          width: sidecar.width,
          height: sidecar.height,
          blurDataUrl: sidecar.blurDataUrl,
          takenAt: sidecar.takenAt,
          exif: compactExif(sidecar.exif) ?? undefined,
          status: 'PUBLISHED',
        },
      })
    }

    // Newest first; existing rows keep their position.
    rows.sort((a, b) => (b.takenAt?.getTime() ?? 0) - (a.takenAt?.getTime() ?? 0) || a.key.localeCompare(b.key))
    const offset = await prisma.photo.count()
    for (const [i, row] of rows.entries()) {
      await prisma.photo.create({ data: { ...row.data, position: offset + i } })
    }
    console.log(`Imported ${rows.length} photo(s)`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
