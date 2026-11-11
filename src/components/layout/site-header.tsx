'use client'

import { Menu } from 'lucide-react'
import NextLink from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { useIsAdmin } from '@/components/layout/use-is-admin'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Link, usePathname } from '@/i18n/navigation'
import { NAV_SECTIONS, type NavSection } from '@/lib/navigation'
import { cn } from '@/lib/utils'

/** Highlights the home-page section currently in view (scroll-spy). */
function useActiveSection(enabled: boolean): NavSection | null {
  const [active, setActive] = useState<NavSection | null>(null)

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as NavSection)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    for (const id of NAV_SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [enabled])

  return enabled ? active : null
}

export function SiteHeader({
  isAdmin: isAdminProp = false,
  sections = NAV_SECTIONS,
}: {
  isAdmin?: boolean
  sections?: readonly NavSection[]
}) {
  const t = useTranslations('nav')
  const isAdmin = useIsAdmin() || isAdminProp
  const pathname = usePathname()
  const isHome = pathname === '/'
  const active = useActiveSection(isHome)
  const [open, setOpen] = useState(false)

  const linkClass = (current: boolean) =>
    cn(
      'rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
      current && 'text-primary font-medium',
    )

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Federico Mattucci
        </Link>

        <nav aria-label={t('primary')} className="hidden items-center gap-1 md:flex">
          {sections.map((id) => (
            <Link
              key={id}
              href={`/#${id}`}
              className={linkClass(active === id)}
              aria-current={active === id ? 'location' : undefined}
            >
              {t(id)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <NextLink href="/admin">{t('admin')}</NextLink>
            </Button>
          )}
          <LanguageSwitcher />
          <ThemeToggle />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('menu')}>
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="gap-0">
              <SheetTitle className="sr-only">{t('menu')}</SheetTitle>
              <SheetDescription className="sr-only">{t('primary')}</SheetDescription>
              <nav aria-label={t('primary')} className="flex flex-col gap-1 p-4 pt-12">
                {sections.map((id) => (
                  <Link
                    key={id}
                    href={`/#${id}`}
                    onClick={() => setOpen(false)}
                    className={cn(linkClass(active === id), 'text-base')}
                  >
                    {t(id)}
                  </Link>
                ))}
                {isAdmin && (
                  <NextLink href="/admin" className={cn(linkClass(false), 'text-base')}>
                    {t('admin')}
                  </NextLink>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
