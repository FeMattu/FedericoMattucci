'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Componente base per la dashboard admin
export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect se non autenticato
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading' || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Image 
                src="/images/logo/Logo-black.jpg" 
                alt="Federico Mattucci Logo" 
                width={150} 
                height={60}
                className="dark:hidden"
              />
              <Image 
                src="/images/logo/Logo-black.jpg" 
                alt="Federico Mattucci Logo" 
                width={150} 
                height={60}
                className="hidden dark:block invert"
              />
            </div>
            <div className="flex items-center">
              {session?.user?.image && (
                <Image 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  width={32} 
                  height={32}
                  className="rounded-full mr-3"
                />
              )}
              <span className="text-gray-700 dark:text-gray-200 mr-4">
                {session?.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard Amministrativa
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Progetti */}
          <Link href="/admin/projects" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Progetti
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gestisci i tuoi progetti e portfolio
            </p>
            <div className="flex justify-end">
              <span className="text-blue-500 dark:text-blue-400">
                Visualizza &rarr;
              </span>
            </div>
          </Link>

          {/* Media */}
          <Link href="/admin/media" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Media
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gestisci immagini e file multimediali
            </p>
            <div className="flex justify-end">
              <span className="text-blue-500 dark:text-blue-400">
                Visualizza &rarr;
              </span>
            </div>
          </Link>

          {/* Traduzioni */}
          <Link href="/admin/translations" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Traduzioni
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gestisci i contenuti multilingua
            </p>
            <div className="flex justify-end">
              <span className="text-blue-500 dark:text-blue-400">
                Visualizza &rarr;
              </span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
