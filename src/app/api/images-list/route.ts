import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface S3Object {
  key: string;
  size: number;
  lastModified: string;
}

async function listAllObjects(bucket: string, prefix: string): Promise<S3Object[]> {
  const allObjects: S3Object[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    const objects = response.Contents?.map((item) => ({
      key: item.Key!,
      size: item.Size || 0,
      lastModified: item.LastModified?.toISOString() || ''
    })).filter(obj => obj.key) || [];
    
    allObjects.push(...objects);
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return allObjects;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path') || '';
  const format = searchParams.get('format') || 'simple'; // 'simple' o 'detailed'

  try {
    const bucket = process.env.AWS_S3_BUCKET!;
    const objects = await listAllObjects(bucket, path);

    // Filtra solo file immagine
    const filtered = objects.filter(obj =>
      obj.key.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)
    );

    // Ritorna formato semplice per retrocompatibilità (Gallery)
    if (format === 'simple') {
      const keys = filtered.map(obj => obj.key);
      return NextResponse.json(keys);
    }

    // Ritorna formato dettagliato per admin media
    return NextResponse.json({ objects: filtered });
  } catch (err) {
    console.error('S3 list error:', err);
    return NextResponse.json({ error: 'Error listing images from S3' }, { status: 500 });
  }
}
