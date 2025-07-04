import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Cache per le risposte API
const CACHE_DURATION = 60 * 60 * 24; // 24 ore in secondi
const imageCache = new Map<string, { data: Record<string, unknown>, timestamp: number }>();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function listAllObjects(bucket: string, prefix: string): Promise<string[]> {
  const allKeys: string[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    const keys = response.Contents?.map((item) => item.Key!).filter(Boolean) || [];
    allKeys.push(...keys);
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return allKeys;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder') || '';

  if (!folder) {
    return NextResponse.json({ error: 'Missing "folder" query parameter' }, { status: 400 });
  }

  // Verifica se abbiamo una risposta nella cache valida
  const cacheKey = `images:${folder}`;
  const now = Date.now();
  const cachedResponse = imageCache.get(cacheKey);
  
  if (cachedResponse && (now - cachedResponse.timestamp) < CACHE_DURATION * 1000) {
    // Risposta dalla cache
    return NextResponse.json(cachedResponse.data, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}`,
        'X-Cache': 'HIT'
      }
    });
  }

  try {
    const bucket = process.env.AWS_S3_BUCKET!;
    const allKeys = await listAllObjects(bucket, folder);

    // Solo file immagine
    const filtered = allKeys.filter(key =>
      key.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)
    );

    // Costruisci gli URL delle immagini
    const images = filtered.map(key => ({
      key,
      url: `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`,
      name: key.split('/').pop()
    }));

    // Memorizza il risultato nella cache
    const responseData = { images };
    imageCache.set(cacheKey, { 
      data: responseData, 
      timestamp: now 
    });

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}`,
        'X-Cache': 'MISS'
      }
    });
  } catch (err) {
    console.error('S3 list error:', err);
    return NextResponse.json({ error: 'Error listing images from S3' }, { status: 500 });
  }
}
