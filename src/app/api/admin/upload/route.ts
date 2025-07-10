import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { S3 } from 'aws-sdk';
import { authOptions } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';

// Middleware di autenticazione per le API admin
async function checkAuth(): Promise<ApiResponse | null> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      success: false,
      message: "Non autorizzato. Effettua l'accesso per utilizzare questa API."
    };
  }
  
  return null; // Nessun errore di autenticazione
}

// Configurazione S3
const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

// POST - Genera un URL firmato per l'upload
export async function POST(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) {
    return NextResponse.json(authError, { status: 401 });
  }
  
  try {
    const { filename, contentType } = await request.json();
    
    if (!filename || !contentType) {
      return NextResponse.json({
        success: false,
        message: "Filename e contentType sono richiesti"
      }, { status: 400 });
    }
    
    // Genera un nome file unico
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const key = `uploads/${uniqueFilename}`;
    
    // Genera l'URL firmato per l'upload
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
      Expires: 60 * 5, // URL valido per 5 minuti
    });
    
    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        key,
      },
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({
      success: false,
      message: "Errore nella generazione dell'URL firmato"
    }, { status: 500 });
  }
}
