"use client"

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslationsSafe';
import { FaFolder, FaImage, FaUpload, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import S3Image from '@/components/S3image';

interface S3Object {
  key: string;
  size: number;
  lastModified: string;
}

interface MediaItem {
  name: string;
  type: 'folder' | 'image';
  path: string;
  size?: number;
  lastModified?: string;
}

export default function MediaPage() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const t = useTranslation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && status === 'authenticated') {
      fetchMediaItems();
    }
  }, [isClient, status, currentPath]);

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/images-list?path=${encodeURIComponent(currentPath)}&format=detailed`);
      if (!response.ok) {
        throw new Error('Failed to fetch media items');
      }
      
      const data = await response.json();
      const processedItems = processS3Objects(data.objects || []);
      setMediaItems(processedItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const processS3Objects = (objects: S3Object[]): MediaItem[] => {
    const items: MediaItem[] = [];
    const folders = new Set<string>();

    objects.forEach(obj => {
      // Rimuovi il prefisso currentPath se presente
      let relativePath = obj.key;
      if (currentPath && obj.key.startsWith(currentPath)) {
        relativePath = obj.key.substring(currentPath.length);
      }
      
      // Rimuovi il / iniziale se presente
      if (relativePath.startsWith('/')) {
        relativePath = relativePath.substring(1);
      }

      // Se il path contiene ancora delle /, è una cartella
      const pathParts = relativePath.split('/');
      if (pathParts.length > 1) {
        const folderName = pathParts[0];
        if (!folders.has(folderName)) {
          folders.add(folderName);
          items.push({
            name: folderName,
            type: 'folder',
            path: currentPath ? `${currentPath}/${folderName}` : folderName
          });
        }
      } else if (relativePath && relativePath.length > 0) {
        // È un file nella cartella corrente
        items.push({
          name: relativePath,
          type: 'image',
          path: obj.key,
          size: obj.size,
          lastModified: obj.lastModified
        });
      }
    });

    // Ordina: cartelle prima, poi file
    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const handleBackClick = () => {
    if (currentPath) {
      const pathParts = currentPath.split('/');
      pathParts.pop();
      setCurrentPath(pathParts.join('/'));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        if (currentPath) {
          formData.append('path', currentPath);
        }

        const response = await fetch('/api/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Ricarica la lista dopo l'upload
      await fetchMediaItems();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
      // Reset dell'input
      event.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isClient || status === 'loading') {
    return <div className="container mx-auto p-6">{t('loading')}</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="container mx-auto p-6">{t('auth.unauthenticated')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaArrowLeft />
            {t('pages.admin.media.backToDashboard')}
          </Link>
          <h1 className="text-3xl font-bold">{t('pages.admin.media.management')}</h1>
        </div>
        
        {/* Upload Button */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <button
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={uploading}
          >
            <FaUpload />
            {uploading ? t('admin.media.uploading') : t('pages.admin.media.uploadImages')}
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentPath && (
        <div className="mb-4">
          <nav className="text-sm breadcrumbs">
            <ul className="flex items-center gap-2">
              <li>
                <button 
                  onClick={() => setCurrentPath('')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Root
                </button>
              </li>
              {currentPath.split('/').map((part, index, arr) => (
                <li key={index} className="flex items-center gap-2">
                  <span>/</span>
                  <button
                    onClick={() => setCurrentPath(arr.slice(0, index + 1).join('/'))}
                    className={index === arr.length - 1 ? 'text-gray-600' : 'text-blue-600 hover:text-blue-800'}
                  >
                    {part}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Back Button (se non siamo nella root) */}
      {currentPath && (
        <div className="mb-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaArrowLeft />
            {t('pages.admin.media.back')}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">{t('loading.images')}</p>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaImage className="mx-auto mb-4 text-4xl" />
            <p>{t('pages.admin.media.noMediaFound')}</p>
            <p className="text-sm mt-2">{t('pages.admin.media.uploadInstructions')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-6">
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  item.type === 'folder' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
                }`}
                onClick={item.type === 'folder' ? () => handleFolderClick(item.path) : undefined}
              >
                {item.type === 'folder' ? (
                  <div className="text-center">
                    <FaFolder className="mx-auto mb-2 text-4xl text-yellow-500" />
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Folder</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <S3Image
                      src={item.path}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <p className="font-medium text-xs truncate" title={item.name}>
                      {item.name}
                    </p>
                    {item.size && (
                      <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                    )}
                    {item.lastModified && (
                      <p className="text-xs text-gray-500">{formatDate(item.lastModified)}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
