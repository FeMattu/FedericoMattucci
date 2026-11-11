import 'server-only'
import { prisma } from '@/lib/db/prisma'
import type { StoredMessage } from '@/lib/contact/service'

export const messagesRepository = {
  create: async (message: StoredMessage): Promise<void> => {
    await prisma.message.create({
      data: {
        name: message.name,
        email: message.email,
        subject: message.subject,
        body: message.message,
        locale: message.locale,
        ipHash: message.ipHash,
      },
    })
  },
  countSince: (ipHash: string, since: Date): Promise<number> =>
    prisma.message.count({ where: { ipHash, createdAt: { gte: since } } }),
  list: () => prisma.message.findMany({ orderBy: { createdAt: 'desc' } }),
  setRead: (id: string, read: boolean) => prisma.message.update({ where: { id }, data: { read } }),
  remove: (id: string) => prisma.message.delete({ where: { id } }),
}
