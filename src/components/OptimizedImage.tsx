'use client';

import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useCache } from '@/providers/CacheProvider';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  placeholder?: PlaceholderValue | undefined;
  blurDataURL?: string | undefined;
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
  placeholder = 'blur',
  blurDataURL = '',
  quality = 75,
  onClick,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(imageCache.has(src));
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { getCache, setCache } = useCache();
  
  // Controlla se abbiamo un blur data URL nella cache
  const cachedBlurData = getCache<string>(`blur:${src}`);
  const effectiveBlurDataURL = blurDataURL || cachedBlurData || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';
  
  // Funzione per precaricare l'immagine
  const preloadImage = (imageSrc: string) => {
    if (typeof window !== 'undefined' && !imageCache.has(imageSrc)) {
      const img = new window.Image();
      img.src = imageSrc;
      img.onload = () => {
        imageCache.set(imageSrc, true);
        setIsLoaded(true);
        
        // Opzionalmente, genera un blur data URL per la prossima volta
        if (!blurDataURL && !cachedBlurData) {
          try {
            // Crea un canvas per generare un blur data URL
            const canvas = document.createElement('canvas');
            canvas.width = 10; // Dimensione molto ridotta per il blur
            canvas.height = 10;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, 10, 10);
              const blurData = canvas.toDataURL('image/jpeg', 0.1);
              setCache(`blur:${imageSrc}`, blurData);
            }
          } catch (e) {
            console.error('Error creating blur data:', e);
          }
        }
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
    
    return () => {
      // Pulizia
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
      }
    };
  }, [src]);

  // Gestione dello stato di errore
  if (error) {
    return (
      <div 
        className={`${className} bg-gray-200 dark:bg-gray-800 flex items-center justify-center`}
        style={{ width: width || '100%', height: height || 300 }}
      >
        <span>Errore nel caricamento</span>
      </div>
    );
  }

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      width={fill ? undefined : (width || 500)}
      height={fill ? undefined : (height || 300)}
      fill={fill}
      sizes={sizes}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-80'} transition-opacity duration-300`}
      priority={priority}
      quality={quality}
      loading={priority ? 'eager' : 'lazy'}
      placeholder={placeholder}
      blurDataURL={effectiveBlurDataURL}
      onLoad={() => {
        setIsLoaded(true);
        imageCache.set(src, true);
      }}
      onClick={onClick}
    />
  );
}
