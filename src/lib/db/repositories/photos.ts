import 'server-only'
import { prisma } from '@/lib/db/prisma'

const published = { status: 'PUBLISHED' } as const

export const photosRepository = {
  /** Published photos; photos in a hidden album are hidden too. */
  photos: () =>
    prisma.photo.findMany({
      where: { ...published, OR: [{ albumId: null }, { album: { status: 'PUBLISHED' } }] },
      orderBy: [{ position: 'asc' }, { takenAt: 'desc' }],
    }),
  albums: () => prisma.album.findMany({ where: published, orderBy: { position: 'asc' } }),
}
