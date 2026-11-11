import { MessagesList } from '@/components/admin/messages-list'
import { requireAdmin } from '@/lib/auth/session'
import { messagesRepository } from '@/lib/db/repositories/messages'

export const metadata = { title: 'Messages' }

export default async function MessagesPage() {
  await requireAdmin()
  const rows = await messagesRepository.list()
  const unread = rows.filter((m) => !m.read).length

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          From the contact form. {unread > 0 ? `${unread} unread.` : 'All read.'}
        </p>
      </header>
      <MessagesList
        messages={rows.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          subject: m.subject,
          body: m.body,
          locale: m.locale,
          read: m.read,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
