"use client"

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import UserInfo from '@/components/UserInfo';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || status === 'loading') {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="container mx-auto p-6">Please sign in to access this page</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('admin.welcome')}, {session?.user?.name || 'User'}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('admin.logged-in-as')} {session?.user?.email}.
        </p>
        <UserInfo />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-2">Projects</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage your portfolio projects</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-2">Content</h3>
            <p className="text-gray-600 dark:text-gray-400">Edit website content and translations</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-2">Media</h3>
            <p className="text-gray-600 dark:text-gray-400">Upload and manage images</p>
          </div>
        </div>
      </div>
    </div>
  );
}
