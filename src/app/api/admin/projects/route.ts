import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
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

// GET - Ottiene tutti i progetti
export async function GET() {
  const authError = await checkAuth();
  if (authError) {
    return NextResponse.json(authError, { status: 401 });
  }
  
  try {
    const projects = await prisma.project.findMany({
      include: {
        translations: true,
        images: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({
      success: false,
      message: 'Errore nel recupero dei progetti',
    }, { status: 500 });
  }
}

// POST - Crea un nuovo progetto
export async function POST(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) {
    return NextResponse.json(authError, { status: 401 });
  }
  
  try {
    const { slug, published, featuredImage, order, tags, translations } = await request.json();
    
    // Validazione dei campi obbligatori
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Il campo slug è obbligatorio',
      }, { status: 400 });
    }
    
    // Controlla se esiste già un progetto con lo stesso slug
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    });
    
    if (existingProject) {
      return NextResponse.json({
        success: false,
        message: 'Esiste già un progetto con questo slug',
      }, { status: 400 });
    }
    
    // Crea il progetto con una transazione per garantire consistenza con le traduzioni
    const newProject = await prisma.$transaction(async (tx) => {
      // Crea il progetto
      const project = await tx.project.create({
        data: {
          slug,
          published: published ?? false,
          featuredImage,
          order: order ?? 0,
          tags: tags ?? [],
        },
      });
      
      // Crea le traduzioni se presenti
      if (translations && translations.length > 0) {
        await tx.translation.createMany({
          data: translations.map((t: any) => ({
            projectId: project.id,
            language: t.language,
            key: t.key,
            value: t.value,
          })),
        });
      }
      
      // Recupera il progetto con le traduzioni
      return tx.project.findUnique({
        where: { id: project.id },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json({
      success: true,
      data: newProject,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({
      success: false,
      message: 'Errore nella creazione del progetto',
    }, { status: 500 });
  }
}
