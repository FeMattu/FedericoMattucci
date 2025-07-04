'use client';

import { useEffect, useState } from 'react';

// Funzione per precaricare un'immagine
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Source non valido'));
      return;
    }

    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Impossibile caricare ${src}`));
    img.src = src;
  });
};

// Hook che precaricare le immagini in background
export function useImagePrefetcher(imageSources: string[]) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageSources.length) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const newLoadedImages: Record<string, boolean> = {};

    // Precaricare tutte le immagini in parallelo
    setIsLoading(true);
    Promise.allSettled(
      imageSources.map(src => 
        preloadImage(src)
          .then(() => {
            if (isMounted) {
              newLoadedImages[src] = true;
            }
          })
          .catch(() => {
            if (isMounted) {
              newLoadedImages[src] = false;
            }
          })
      )
    ).then(() => {
      if (isMounted) {
        setLoadedImages(newLoadedImages);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageSources]);

  return { loadedImages, isLoading };
}

// Componente che precaricare le immagini in background
export default function ImagePrefetcher({ 
  imageSources,
  children 
}: {
  imageSources: string[];
  children: React.ReactNode;
}) {
  const { isLoading } = useImagePrefetcher(imageSources);

  return (
    <>
      {children}
      {/* Opzionalmente mostrare un indicatore di caricamento */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 opacity-20 dark:opacity-10">
          <div className="w-4 h-4 rounded-full animate-ping bg-gray-400"></div>
        </div>
      )}
    </>
  );
}
