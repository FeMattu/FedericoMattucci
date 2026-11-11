import { signOut } from '@/auth'
import { AdminHint } from '@/components/admin/admin-hint'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { requireAdmin } from '@/lib/auth/session'

/**
 * The only place with a sidebar. `requireAdmin()` runs here AND in every
 * server action: a layout check alone would not protect direct action calls.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  async function signOutAction() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <SidebarProvider>
      <AdminSidebar email={session.user?.email ?? ''} signOutAction={signOutAction} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger aria-label="Toggle sidebar" />
        </header>
        <div className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">{children}</div>
        <AdminHint />
      </SidebarInset>
    </SidebarProvider>
  )
}
