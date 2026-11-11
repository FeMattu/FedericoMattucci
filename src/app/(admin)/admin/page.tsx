import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { RESOURCES, RESOURCE_KEYS } from '@/lib/admin/resources'
import { requireAdmin } from '@/lib/auth/session'
import { adminRepository as repo } from '@/lib/db/repositories/admin'
import { prisma } from '@/lib/db/prisma'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  await requireAdmin()
  const [counts, unread, locales] = await Promise.all([
    Promise.all(RESOURCE_KEYS.map(async (key) => [key, await repo.count(key)] as const)),
    prisma.message.count({ where: { read: false } }),
    repo.locales(),
  ])

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything on the public site is edited from here.</p>
      </header>

      <section aria-labelledby="content-title">
        <h2 id="content-title" className="sr-only">
          Content
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map(([key, count]) => (
            <li key={key}>
              <Link href={`/admin/${key}`} className="block rounded-lg border p-4 transition-colors hover:border-primary/50">
                <p className="text-sm text-muted-foreground">{RESOURCES[key].plural}</p>
                <p className="mt-1 text-2xl font-semibold">{count}</p>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/admin/messages" className="block rounded-lg border p-4 transition-colors hover:border-primary/50">
              <p className="text-sm text-muted-foreground">Unread messages</p>
              <p className="mt-1 text-2xl font-semibold">
                {unread} {unread > 0 && <Badge className="ml-1 align-middle">New</Badge>}
              </p>
            </Link>
          </li>
          <li>
            <Link href="/admin/languages" className="block rounded-lg border p-4 transition-colors hover:border-primary/50">
              <p className="text-sm text-muted-foreground">Languages</p>
              <p className="mt-1 text-2xl font-semibold">{locales.filter((l) => l.enabled).length}</p>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
