'use client';

import { useEffect, ReactNode } from 'react';

interface ImagePrefetcherProps {
  imageSources: string[];
  children: ReactNode;
}

/**
 * Componente che precaricare le immagini in background
 * @param imageSources Array di URL delle immagini da precaricare
 * @param children Componenti figlio da renderizzare
 */
export default function ImagePrefetcher({ imageSources, children }: ImagePrefetcherProps) {
  useEffect(() => {
    // Prefetch delle immagini in background
    const prefetchImages = async () => {
      const imagePromises = imageSources.map((src) => {
        return new Promise<void>((resolve) => {
          if (typeof window !== 'undefined') {
            const img = new window.Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Risolve anche in caso di errore per non bloccare
          } else {
            resolve();
          }
        });
      });

      // Esegue in parallelo, ma con un limite di 5 immagini alla volta per non sovraccaricare
      const batchSize = 5;
      for (let i = 0; i < imagePromises.length; i += batchSize) {
        const batch = imagePromises.slice(i, i + batchSize);
        await Promise.all(batch);
      }
    };

    prefetchImages();
  }, [imageSources]);

  return <>{children}</>;
}
