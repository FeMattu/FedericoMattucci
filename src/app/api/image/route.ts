import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

// Funzione helper per generare l'attributo alt a partire dal nome del file
function getAltFromKey(key: string): string {
  const name = key.split('/').pop() || '';
  return name.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key'); // es. ?key=portfolio/street-photography/ferrari.jpg

  if (!key) {
    return NextResponse.json({ error: 'Missing "key" query parameter.' }, { status: 400 });
  }

  // Recupera il bucket S3 e crea un client S3
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    return NextResponse.json({ error: 'S3 bucket not configured.' }, { status: 500 });
  }
  const s3 = new S3Client({ region: process.env.AWS_REGION });

  // Effettua il comando Head per ottenere i metadati dell'oggetto
  let metadataResponse;
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    metadataResponse = await s3.send(headCommand);
  } catch (error) {
    console.error('Error fetching S3 metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch image metadata.' }, { status: 500 });
  }

  // Estrai metadati (assicurati che, in fase di upload, tu abbia salvato metadati custom come width, height, exif)
  const width = metadataResponse.Metadata?.width || null;
  const height = metadataResponse.Metadata?.height || null;
  const exif = metadataResponse.Metadata?.exif || null;
  const type = metadataResponse.ContentType || null;

  // Costruisci l'URL dell'oggetto tramite CloudFront
  const baseUrl = process.env.CLOUDFRONT_URL || '';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const resourceKey = key.startsWith('/') ? key.substring(1) : key;
  const resourceUrl = `${normalizedBase}/${resourceKey}`;

  // Genera l'URL per la versione blur:
  // Se il percorso inizia con "portfolio", lo sostituisci con "blur/portfolio",
  // altrimenti aggiungi "blur/" come prefisso
  const blurKey = `blur/${resourceKey}`;
  const blurResourceUrl = `${normalizedBase}/${blurKey}`;

  // Recupera e formatta la chiave privata
  const rawPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY || '';
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  let signedUrl, signedBlurUrl;
  try {
    // URL firmata per l'immagine originale (valida per 1 ora)
    signedUrl = getSignedUrl({
      url: resourceUrl,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
      privateKey,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
    });

    // URL firmata per la versione blur
    signedBlurUrl = getSignedUrl({
      url: blurResourceUrl,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
      privateKey,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
    });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }

  // Restituisce i metadati completi insieme agli URL firmati
  return NextResponse.json({
    url: signedUrl,
    blurUrl: signedBlurUrl,
    name: key.split('/').pop(),
    alt: getAltFromKey(key),
    width,
    height,
    type,
    exif,
  });
}
