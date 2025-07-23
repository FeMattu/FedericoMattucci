import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const cloudfrontUrl = process.env.CLOUDFRONT_URL || '';
const normalizedBase = cloudfrontUrl.endsWith('/') ? cloudfrontUrl.slice(0, -1) : cloudfrontUrl;
// Recupera e formatta la chiave privata
const rawPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY || '';
const privateKey = rawPrivateKey.replace(/\n/g, '\n');
const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID || '';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function generateSignedUrl(key: string): string {
  // Costruisci l'URL dell'oggetto tramite CloudFront
  const resourceKey = key.startsWith('/') ? key.substring(1) : key;
  const resourceUrl = `${normalizedBase}/${resourceKey}`;

  // URL firmata per l'immagine o metadato (valida per 1 ora)
  return getSignedUrl({
    url: resourceUrl,
    keyPairId,
    privateKey,
    dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
  });
}

// Funzione helper per generare l'attributo alt a partire dal nome del file
function getAltFromKey(key: string): string {
  const name = key.split('/').pop() || '';
  return name.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  try {
    const signedUrl = generateSignedUrl(filename);
    const jsonFilename = filename.replace(/\.[^/.]+$/, ".json");
    const metadataUrl = generateSignedUrl(jsonFilename);
    const metadataRes = await fetch(metadataUrl);

    if (!metadataRes.ok) {
      return NextResponse.json({ error: "Metadata not found" }, { status: 404 });
    }

    const metadata = await metadataRes.json();

    return NextResponse.json({
      url: signedUrl,
      name: filename.split('/').pop(),
      alt: getAltFromKey(filename),
      metadata
    });
  } catch (error) {
    console.error("Errore nel recupero metadati o generazione URL firmati:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Genera un nome univoco per il file
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    
    // Costruisci la key S3 con il path se fornito
    const key = path ? `${path}/${fileName}` : fileName;

    // Converti il file in buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload su S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3.send(uploadCommand);

    // Genera metadati
    const metadata = {
      filename: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      dimensions: null, // Potresti aggiungere logica per estrarre dimensioni
    };

    // Salva i metadati come file JSON separato
    const metadataKey = key.replace(/\.[^/.]+$/, ".json");
    const metadataCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: metadataKey,
      Body: JSON.stringify(metadata),
      ContentType: 'application/json',
    });

    await s3.send(metadataCommand);

    // Genera URL firmato per l'immagine appena caricata
    const signedUrl = generateSignedUrl(key);

    return NextResponse.json({
      success: true,
      key,
      url: signedUrl,
      metadata,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
