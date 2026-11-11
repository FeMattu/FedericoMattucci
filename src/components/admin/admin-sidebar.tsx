'use client'

import {
  Briefcase,
  GraduationCap,
  Images,
  Languages,
  LayoutDashboard,
  LogOut,
  Mail,
  Medal,
  Moon,
  Rocket,
  Share2,
  Sparkles,
  Sun,
  Type,
  Album,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ADMIN_HINT_KEY } from '@/lib/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const GROUPS = [
  {
    label: 'Content',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/site-texts', label: 'Site texts', icon: Type },
      { href: '/admin/experience', label: 'Experience', icon: Briefcase },
      { href: '/admin/education', label: 'Education', icon: GraduationCap },
      { href: '/admin/skills', label: 'Skills', icon: Sparkles },
      { href: '/admin/projects', label: 'Projects', icon: Rocket },
      { href: '/admin/certifications', label: 'Certifications', icon: Medal },
    ],
  },
  {
    label: 'Media',
    items: [
      { href: '/admin/photos', label: 'Photos', icon: Images },
      { href: '/admin/albums', label: 'Albums', icon: Album },
    ],
  },
  {
    label: 'Site',
    items: [
      { href: '/admin/social-links', label: 'Social links', icon: Share2 },
      { href: '/admin/languages', label: 'Languages', icon: Languages },
      { href: '/admin/messages', label: 'Messages', icon: Mail },
    ],
  },
] as const

type Props = { email: string; signOutAction: () => Promise<void> }

export function AdminSidebar({ email, signOutAction }: Props) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <p className="truncate px-2 py-1 text-sm font-semibold">Admin</p>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const exact = 'exact' in item && item.exact
                  const active = exact ? pathname === item.href : pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href} aria-current={active ? 'page' : undefined}>
                          <item.icon aria-hidden />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View site">
              <Link href="/">
                <Share2 aria-hidden />
                <span>View site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Toggle theme"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
              <span>Toggle theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form
              action={signOutAction}
              onSubmit={() => {
                try {
                  localStorage.removeItem(ADMIN_HINT_KEY)
                } catch {
                  // Optional hint only.
                }
              }}
            >
              <SidebarMenuButton type="submit" tooltip="Sign out">
                <LogOut aria-hidden />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="truncate px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">{email}</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
