"use client";

import * as exifr from 'exifr';
import { getPlaiceholder } from 'plaiceholder';

type Nullable<T> = T | null;

export interface FullImageMetadata {
  filename: string;
  width: number;
  height: number;
  dpi: [Nullable<string>, Nullable<string>];
  filesize_bytes: Nullable<number>;
  filesize_mb: Nullable<number>;
  alt: string;
  exif: {
    make: Nullable<string>;
    model: Nullable<string>;
    lens_model: Nullable<string>;
    lens_spec: Nullable<string>;
    datetime_original: Nullable<string>;
    exposure_time: Nullable<string>;
    shutter_speed: Nullable<string>;
    aperture: Nullable<string>;
    aperture_value: Nullable<string>;
    iso: Nullable<string>;
    focal_length: Nullable<string>;
    white_balance: Nullable<string>;
    flash: Nullable<string>;
    metering_mode: Nullable<string>;
    exposure_mode: Nullable<string>;
    exposure_value: Nullable<number>;
    copyright: Nullable<string>;
  };
  blurDataUrl: string;
}

/**
 * Accetta File, Blob, ArrayBuffer o URL string.
 * Restituisce metadati completi in stile DSC02630.json
 */
export async function extractFullImageMetadata(
  source: File | Blob | ArrayBuffer | string
): Promise<FullImageMetadata> {
  /* ---------- filename & alt ---------- */
  const rawName =
    source instanceof File
      ? source.name
      : typeof source === 'string'
      ? source.split('/').pop() || 'image'
      : 'image';
  const filename = rawName.replace(/\?.*$/, ''); // togli eventuali query
  const alt = filename.split('.').slice(0, -1).join('.').replace(/[-_]/g, ' ');

  /* ---------- basic size ---------- */
  const { width, height } = await new Promise<{ width: number; height: number }>((res, rej) => {
    const img = new Image();
    img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = rej;
    if (source instanceof File || source instanceof Blob) {
      img.src = URL.createObjectURL(source);
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      img.src = URL.createObjectURL(new Blob([source]));
    }
  });

  /* ---------- file size & dpi ---------- */
  const filesize_bytes =
    source instanceof File ? source.size : source instanceof Blob ? source.size : null;
  const filesize_mb = filesize_bytes ? +(filesize_bytes / 1024 / 1024).toFixed(2) : null;

  let dpiX: Nullable<string> = null;
  let dpiY: Nullable<string> = null;
  // exifr.read() può dare XResolution/YResolution
  const basicExif = await exifr.parse(source, { tiff: true }).catch(() => ({}));
  if (basicExif?.XResolution && basicExif?.YResolution) {
    dpiX = String(basicExif.XResolution);
    dpiY = String(basicExif.YResolution);
  }

  /* ---------- exif dettagliato ---------- */
  const tags = await exifr.parse(source).catch(() => ({}));

  const get = (k: string): string | null =>
    tags && tags[k] !== undefined && tags[k] !== null ? String(tags[k]) : null;

  const fractionToNumber = (val: any): Nullable<number> => {
    if (!val) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  // calcolo EV = log2( (f^2) / t )
  const calcEV = (): Nullable<number> => {
    const fNum = fractionToNumber(tags?.FNumber);
    const t = fractionToNumber(tags?.ExposureTime);
    if (!fNum || !t) return null;
    const ev = Math.log2((fNum ** 2) / t);
    return +ev.toFixed(2);
  };

  const exif = {
    make: get('Make'),
    model: get('Model'),
    lens_model: get('LensModel'),
    lens_spec: get('LensSpecification'),
    datetime_original: get('DateTimeOriginal'),
    exposure_time: get('ExposureTime'),
    shutter_speed: get('ShutterSpeedValue'),
    aperture: tags?.FNumber ? `f/${(+tags.FNumber).toFixed(1)}` : null,
    aperture_value: get('FNumber'),
    iso: get('ISO'),
    focal_length: get('FocalLength'),
    white_balance: get('WhiteBalance'),
    flash: get('Flash'),
    metering_mode: get('MeteringMode'),
    exposure_mode: get('ExposureMode'),
    exposure_value: calcEV(),
    copyright: get('Copyright')
  };

  /* ---------- blurDataUrl ---------- */
  const buffer =
    source instanceof File || source instanceof Blob
      ? await source.arrayBuffer()
      : typeof source === 'string'
      ? await fetch(source).then((r) => r.arrayBuffer())
      : source;
  const { base64 } = await getPlaiceholder(Buffer.from(buffer));

  /* ---------- risultato ---------- */
  return {
    filename,
    width,
    height,
    dpi: [dpiX, dpiY],
    filesize_bytes,
    filesize_mb,
    alt,
    exif,
    blurDataUrl: base64
  };
}
