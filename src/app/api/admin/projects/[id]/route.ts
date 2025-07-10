import { NextResponse } from 'next/server';
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

// GET - Recupera un progetto specifico per ID
export async function GET(request: Request) {
  const authError = await checkAuth();
  if (authError) {
    return NextResponse.json(authError, { status: 401 });
  }

  // Recupera l'ID dalla URL
  const { searchParams, pathname } = new URL(request.url);
  const id = pathname.split("/").pop(); // ultimo segmento URL = id

  if (!id) {
    return NextResponse.json({
      success: false,
      message: "ID mancante nella richiesta",
    }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        translations: true,
        images: true,
      },
    });

    if (!project) {
      return NextResponse.json({
        success: false,
        message: "Progetto non trovato",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({
      success: false,
      message: "Errore nel recupero del progetto",
    }, { status: 500 });
  }
}


// PUT - Aggiorna un progetto esistente
export async function PUT(request: Request) {
  const authError = await checkAuth();
  if (authError) {
    return NextResponse.json(authError, { status: 401 });
  }

  const { pathname } = new URL(request.url);
  const id = pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({
      success: false,
      message: 'ID mancante nella richiesta.',
    }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { slug, published, featuredImage, order, tags, translations } = body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({
        success: false,
        message: 'Progetto non trovato',
      }, { status: 404 });
    }

    if (slug && slug !== project.slug) {
      const existing = await prisma.project.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        return NextResponse.json({
          success: false,
          message: 'Slug già utilizzato da altro progetto',
        }, { status: 400 });
      }
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          slug: slug ?? project.slug,
          published: published ?? project.published,
          featuredImage: featuredImage ?? project.featuredImage,
          order: order ?? project.order,
          tags: tags ?? project.tags,
        },
      });

      if (translations && translations.length > 0) {
        for (const translation of translations) {
          if (translation.id) {
            await tx.translation.update({
              where: { id: translation.id },
              data: { value: translation.value },
            });
          } else {
            await tx.translation.create({
              data: {
                projectId: id,
                language: translation.language,
                key: translation.key,
                value: translation.value,
              },
            });
          }
        }
      }

      return tx.project.findUnique({
        where: { id },
        include: { translations: true, images: true },
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({
      success: false,
      message: 'Errore aggiornamento progetto',
    }, { status: 500 });
  }
}

// DELETE - Elimina un progetto
export async function DELETE(request: Request) {
  const authError = await checkAuth();
  if (authError) {
    return NextResponse.json(authError, { status: 401 });
  }

  const { pathname } = new URL(request.url);
  const id = pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({
      success: false,
      message: 'ID mancante nella richiesta.',
    }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({
        success: false,
        message: 'Progetto non trovato',
      }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Progetto eliminato correttamente',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({
      success: false,
      message: 'Errore eliminazione progetto',
    }, { status: 500 });
  }
}