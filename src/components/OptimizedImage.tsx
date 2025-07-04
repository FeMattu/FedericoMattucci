'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  onClick?: () => void;
}

// Cache per memorizzare le immagini già caricate
const imageCache = new Map<string, boolean>();

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '100vw',
  className = '',
  priority = false,
  quality = 75,
  onClick,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(imageCache.has(src));
  const [error, setError] = useState(false);
  
  // Funzione per precaricare l'immagine
  const preloadImage = (imageSrc: string) => {
    if (typeof window !== 'undefined' && !imageCache.has(imageSrc)) {
      const img = new window.Image();
      img.src = imageSrc;
      img.onload = () => {
        imageCache.set(imageSrc, true);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setError(true);
      };
    }
  };
  
  useEffect(() => {
    // Se l'immagine non è nel cache, precaricarla
    if (!imageCache.has(src)) {
      preloadImage(src);
    }
    
    // Precaricare l'immagine successiva (implementazione opzionale)
    return () => {
      // Pulizia (se necessario)
    };
  }, [src]);
  
  return (
    <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''} ${className}`}>
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          <span className="text-sm text-gray-500">Immagine non disponibile</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : (width || 100)}
          height={fill ? undefined : (height || 100)}
          fill={fill}
          sizes={sizes}
          className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${className}`}
          priority={priority}
          quality={quality}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => {
            imageCache.set(src, true);
            setIsLoaded(true);
          }}
          onError={() => setError(true)}
          onClick={onClick}
        />
      )}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}
    </div>
  );
}
