import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');  // e.g. ?key=path/to/image.jpg

  if (!key) {
    // Missing key parameter
    return NextResponse.json({ error: 'Missing "key" query parameter.' }, { status: 400 });
  }

  // Build the full URL to the S3 object through CloudFront
  const baseUrl = process.env.CLOUDFRONT_URL || ''; 
  // Ensure there are no duplicate slashes when concatenating
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const resourceKey = key.startsWith('/') ? key.substring(1) : key;
  const resourceUrl = `${normalizedBase}/${resourceKey}`;

  // Retrieve and format the private key (replace literal \n with actual newlines)
  const rawPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY || '';
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  try {
    // Generate a signed URL that expires in 1 hour from now
    const signedUrl = getSignedUrl({
      url: resourceUrl,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',     // CloudFront Key Pair ID
      privateKey: privateKey,                                  // RSA private key with newlines
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000)      // expiration time (current time + 1 hour)
    });
    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
