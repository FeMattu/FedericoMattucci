import 'server-only'
import exifr from 'exifr'
import sharp from 'sharp'
import { compactExif, fromExifr, type PhotoExif } from '@/lib/photos/metadata'
import { MAX_DIMENSION } from './validate'

export type ProcessedImage = {
  /** The bytes to store: the original, or a downscaled copy when it was larger than MAX_DIMENSION. */
  buffer: Buffer
  resized: boolean
  width: number
  height: number
  blurDataUrl: string
  takenAt?: Date
  exif: PhotoExif | null
}

/**
 * Reads size and EXIF from the uploaded bytes, builds the blur placeholder and
 * downscales oversized originals. Orientation is applied, so width/height are
 * what a viewer sees. Throws on bytes that are not a decodable image.
 */
export async function processImage(input: Buffer, maxDimension: number = MAX_DIMENSION): Promise<ProcessedImage> {
  // EXIF first: sharp's re-encode below would drop it from the stored copy.
  const rawExif: unknown = await exifr
    .parse(input, { tiff: true, exif: true, gps: true, reviveValues: false, translateValues: false })
    .catch(() => undefined)
  const { takenAt, exif } = fromExifr(rawExif)

  const oriented = sharp(input).rotate()
  const meta = await oriented.metadata()
  if (!meta.width || !meta.height) throw new Error('Not a readable image')
  const rotated = (meta.orientation ?? 1) >= 5
  const width = rotated ? meta.height : meta.width
  const height = rotated ? meta.width : meta.height

  const tooLarge = Math.max(width, height) > maxDimension
  let buffer = input
  let finalWidth = width
  let finalHeight = height
  if (tooLarge) {
    const resized = await oriented
      .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true })
    buffer = resized.data
    finalWidth = resized.info.width
    finalHeight = resized.info.height
  }

  const blur = await sharp(input).rotate().resize(10, 10, { fit: 'inside' }).jpeg({ quality: 50 }).toBuffer()

  return {
    buffer,
    resized: tooLarge,
    width: finalWidth,
    height: finalHeight,
    blurDataUrl: `data:image/jpeg;base64,${blur.toString('base64')}`,
    takenAt,
    exif: compactExif(exif),
  }
}
