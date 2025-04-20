import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const cloudfrontUrl = process.env.CLOUDFRONT_URL || '';
const normalizedBase = cloudfrontUrl.endsWith('/') ? cloudfrontUrl.slice(0, -1) : cloudfrontUrl;
// Recupera e formatta la chiave privata
const rawPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY || '';
const privateKey = rawPrivateKey.replace(/\n/g, '\n');
const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID || '';

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
