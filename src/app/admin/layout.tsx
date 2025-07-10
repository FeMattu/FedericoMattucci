import AdminSessionProvider from './providers';
import { Inter } from 'next/font/google';
import "@/styles/globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Admin Dashboard - Federico Mattucci',
  description: 'Pannello di amministrazione',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <AdminSessionProvider>
          {children}
        </AdminSessionProvider>
      </body>
    </html>
  )
}
