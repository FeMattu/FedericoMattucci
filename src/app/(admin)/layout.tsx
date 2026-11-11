import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import '../globals.css'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
}

/** Root layout of the admin area (no locale routing, English UI). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
      <body className="min-h-dvh font-sans">
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
