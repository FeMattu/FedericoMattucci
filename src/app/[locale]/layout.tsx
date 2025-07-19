import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from "@/components/layout/header";
import "@/styles/globals.css";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CacheProvider } from "@/providers/CacheProvider";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Federico Mattucci",
  description: "Personal website of Federico Mattucci",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo/Logo-black-big.jpg" sizes="any" />
        <Analytics/>
        <SpeedInsights/>
      </head>
      <body className="font-sans">
        <SessionProvider>
          <ThemeProvider>
            <CacheProvider>
              <NextIntlClientProvider locale={locale}>
                <Header />
                {children}
                <Footer />
              </NextIntlClientProvider>
            </CacheProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
