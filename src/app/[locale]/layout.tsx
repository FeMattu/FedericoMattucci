import type { Metadata } from "next";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Header from "@/components/layout/header";
import "@/styles/globals.css";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CacheProvider } from "@/providers/CacheProvider";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "Federico Mattucci",
  description: "Personal website of Federico Mattucci",
};

// Aggiunto per evitare il reloading completo della pagina durante la navigazione
export const runtime = 'edge';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../../public/languages/${locale}.json`)).default;
  } catch (err) {
    console.error("Errore nel caricamento dei messaggi:", err);
    notFound();
  }
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo/Logo-black-big.jpg" sizes="any" />
        <link rel="preconnect" href="https://db9pbmct2ycbl.cloudfront.net" />
        <Analytics/>
        <SpeedInsights/>
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <CacheProvider>
            <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Rome">
              <Header />
              {children}
              <Footer />
            </NextIntlClientProvider>
          </CacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
