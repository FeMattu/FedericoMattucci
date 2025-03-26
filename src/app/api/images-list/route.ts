import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

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
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Missing "path" query parameter' }, { status: 400 });
  }

  try {
    const bucket = process.env.AWS_S3_BUCKET!;
    const images = await listAllObjects(bucket, path);

    // Solo file immagine
    const filtered = images.filter(key =>
      key.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)
    );

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('S3 list error:', err);
    return NextResponse.json({ error: 'Error listing images from S3' }, { status: 500 });
  }
}
