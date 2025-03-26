import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    console.log('Richiesta image con key:', key)

    if (!key) {
      return NextResponse.json({ error: 'Chiave mancante' }, { status: 400 })
    }

    const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL
    const CLOUDFRONT_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID
    const CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!CLOUDFRONT_URL || !CLOUDFRONT_KEY_PAIR_ID || !CLOUDFRONT_PRIVATE_KEY) {
      console.error('Variabili .env mancanti')
      return NextResponse.json({ error: 'Configurazione mancante' }, { status: 500 })
    }

    const signedUrl = getSignedUrl({
      url: `${CLOUDFRONT_URL}/${key}`,
      keyPairId: CLOUDFRONT_KEY_PAIR_ID,
      privateKey: CLOUDFRONT_PRIVATE_KEY,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
    })

    return NextResponse.json({ url: signedUrl })
  } catch (err) {
    console.error('Errore nel route images:', err)
    return NextResponse.json({ error: 'Errore interno server' }, { status: 500 })
  }
}

