import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { ApiResponse, ImageData } from '@/lib/types';

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

// GET - Ottiene tutte le immagini
export async function GET(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) {
    return NextResponse.json(authError, { status: 401 });
  }
  
  try {
    // Ottieni parametri di query opzionali
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    // Costruisci i filtri di ricerca
    const where = projectId ? { projectId } : {};
    
    // Ottieni le immagini
    const images = await prisma.image.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({
      success: false,
      message: "Errore nel recupero delle immagini",
    }, { status: 500 });
  }
}

// POST - Salva i metadati di una nuova immagine
export async function POST(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) {
    return NextResponse.json(authError, { status: 401 });
  }
  
  try {
    const data: Partial<ImageData> = await request.json();
    
    // Verifica che i campi obbligatori siano presenti
    if (!data.filename || !data.key) {
      return NextResponse.json({
        success: false,
        message: "Filename e key sono campi obbligatori",
      }, { status: 400 });
    }
    
    // Crea l'immagine nel database
    const image = await prisma.image.create({
      data: {
        filename: data.filename,
        key: data.key,
        projectId: data.projectId,
        width: data.width,
        height: data.height,
        altText: data.altText,
        caption: data.caption,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: image,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating image record:', error);
    return NextResponse.json({
      success: false,
      message: "Errore nella creazione del record dell'immagine",
    }, { status: 500 });
  }
}
