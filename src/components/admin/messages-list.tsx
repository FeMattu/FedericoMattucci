'use client'

import { Mail, MailOpen, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteMessage, setMessageRead } from '@/actions/admin-site'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/lib/admin/messages'

export type MessageItem = {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  locale: string | null
  read: boolean
  createdAt: string
}

export function MessagesList({ messages }: { messages: MessageItem[] }) {
  const router = useRouter()

  const toggleRead = async (m: MessageItem) => {
    const result = await setMessageRead(m.id, !m.read)
    if (!result.ok) toast.error(errorMessage(result.error))
    else router.refresh()
  }

  const remove = async (m: MessageItem) => {
    const result = await deleteMessage(m.id)
    if (!result.ok) toast.error(errorMessage(result.error))
    else {
      toast.success('Message deleted')
      router.refresh()
    }
  }

  if (messages.length === 0) return <p className="text-sm text-muted-foreground">No messages yet.</p>

  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li key={m.id} className={`rounded-lg border p-4 ${m.read ? '' : 'border-primary/50 bg-card'}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">
                {m.name} {!m.read && <Badge className="ml-1">New</Badge>}
              </p>
              <p className="text-sm text-muted-foreground">
                <a href={`mailto:${m.email}`} className="hover:underline">
                  {m.email}
                </a>
                {' · '}
                <time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</time>
                {m.locale && ` · ${m.locale}`}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={m.read ? 'Mark as unread' : 'Mark as read'}
                onClick={() => toggleRead(m)}
              >
                {m.read ? <Mail className="size-4" aria-hidden /> : <MailOpen className="size-4" aria-hidden />}
              </Button>
              <ConfirmDialog
                title="Delete message?"
                description={`The message from ${m.name} will be permanently deleted.`}
                onConfirm={() => remove(m)}
              >
                <Button variant="ghost" size="icon" aria-label={`Delete message from ${m.name}`}>
                  <Trash2 className="size-4 text-destructive" aria-hidden />
                </Button>
              </ConfirmDialog>
            </div>
          </div>
          {m.subject && <p className="mt-3 text-sm font-medium">{m.subject}</p>}
          {/* Plain text: whitespace preserved, never interpreted as HTML. */}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
        </li>
      ))}
    </ul>
  )
}
