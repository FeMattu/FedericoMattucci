/* eslint-disable */
'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import getIcon from '@/utils/IconMap';
import { useTranslations } from "next-intl";
import { format } from 'date-fns';
import { useCache } from '@/providers/CacheProvider';
import OptimizedImage from './OptimizedImage';

type ExifData = {
  aperture?: string;
  exposure_time?: string;
  iso?: string | number;
  make?: string;
  model?: string;
  lens_model?: string;
  datetime_original?: string;
  gps?: {
    latitude: string | number;
    longitude: string | number;
  };
};

type ImageMetadataResponse = {
  url: string;
  name: string;
  alt: string;
  metadata: {
    width: number;
    height: number;
    dpi?: [number, number];
    filesize_bytes: number;
    filesize_mb: number;
    blurDataUrl?: string;
    exif: ExifData;
  };
};

type Props = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  lightbox?: boolean;
};

export default function S3Image({ src, alt = '', width, height, className = '', lightbox = true }: Props) {
  const [metadata, setMetadata] = useState<ImageMetadataResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  // Gestione swipe up/down per mostrare/nascondere le informazioni
  const [showInfo, setShowInfo] = useState(false);
  const touchStartYRef = useRef<number | null>(null);
  const t = useTranslations();
  const { setCache, getCache } = useCache();
  const cacheKey = `image:${src}`;
  const [blurImage, setBlurImage] = useState<string | undefined>(undefined);

  // Controlla inizialmente se abbiamo un blur image in cache
  useEffect(() => {
    const cachedBlur = getCache<string>(`blur:${src}`);
    if (cachedBlur) {
      setBlurImage(cachedBlur);
    }
  }, [src, getCache]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Controlla se i metadati sono già nella cache
        const cachedMetadata = getCache<ImageMetadataResponse>(cacheKey);
        if (cachedMetadata) {
          setMetadata(cachedMetadata);
          // Se c'è un blurDataUrl nei metadati, usalo
          if (cachedMetadata.metadata?.blurDataUrl) {
            setBlurImage(cachedMetadata.metadata.blurDataUrl);
            // Salva anche nella cache per OptimizedImage
            setCache(`blur:${src}`, cachedMetadata.metadata.blurDataUrl);
          }
          return;
        }

        // Altrimenti, recupera i metadati dall'API
        const res = await fetch(`/api/image?filename=${encodeURIComponent(src)}`);
        if (!res.ok) throw new Error('Impossibile caricare metadati');
        const data: ImageMetadataResponse = await res.json();
        
        // Salva il blurDataUrl se esiste
        if (data.metadata?.blurDataUrl) {
          setBlurImage(data.metadata.blurDataUrl);
          // Salva anche nella cache per OptimizedImage
          setCache(`blur:${src}`, data.metadata.blurDataUrl);
        }
        
        // Salva i metadati nella cache
        setCache<ImageMetadataResponse>(cacheKey, data);
        setMetadata(data);
      } catch (error) {
        console.error('Errore nel caricamento metadati:', error);
      }
    };

    fetchMetadata();
  }, [src, cacheKey, setCache, getCache]);

  if (!metadata) {
    // Mostra un placeholder con blur se possibile
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 animate-pulse ${className} rounded-xl overflow-hidden`} style={{ height: height || 250, width: width || '100%' }}>
        {blurImage && (
          <Image 
            src={blurImage} 
            alt="Loading..." 
            fill 
            className="object-cover opacity-30" 
            style={{ filter: 'blur(20px)' }} 
          />
        )}
      </div>
    );
  }

  const handleSwipeUp = () => setShowInfo(true);
  const handleSwipeDown = () => setShowInfo(false);

  const imageWidth = width ?? metadata.metadata?.width ?? 1000;
  const imageHeight = height ?? metadata.metadata?.height ?? 250;
  const blur = blurImage || metadata.metadata?.blurDataUrl;
  const exif: ExifData = metadata.metadata.exif || {};
  const iconSize = 20; // Dimensione dell'icona in pixel

  const InfoTag = ({ icon, value }: { icon: ReactNode; value: string | number }) => (
    <li className="inline-flex items-center bg-gray-200 dark:bg-zinc-800 px-3 py-1 rounded-full">
      {icon}
      <span className="ml-2 text-center">{value}</span>
    </li>
  );

  const parseExifDate = (input: string) => {
    const [date, time] = input.split(' ');
    const fixedDate = date.replace(/:/g, '-'); // "2023-07-25"
    return new Date(`${fixedDate}T${time}`);  // "2023-07-25T20:21:15"
  };

  return (
    <>
      <OptimizedImage
        src={metadata.url}
        alt={metadata.alt || alt}
        width={imageWidth}
        height={imageHeight}
        className={`${className} ${lightbox ? 'cursor-zoom-in' : ''}`}
        priority={false}
        quality={80}
        placeholder={blur ? 'blur' : 'empty'}
        blurDataURL={blur}
        onClick={lightbox ? () => setIsOpen(true) : undefined}
      />

      <AnimatePresence>
        {lightbox && isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <div
              className="text-black dark:text-white rounded-xl shadow-lg max-w-7xl w-full h-[90vh] flex flex-col md:flex-row overflow-hidden backdrop-blur-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bottone chiusura */}
              <button
                className="absolute top-4 right-4 z-10 bg-transparent hover:scale-110 transition-transform"
                onClick={() => setIsOpen(false)}
                aria-label="Chiudi lightbox"
              >
                {getIcon("close-menu-mobile", 24)}
              </button>

              {/* Immagine con padding mobile */}
              <div
                className="relative flex-1 flex items-center justify-center px-4 py-6"
                onTouchStart={(e) => (touchStartYRef.current = e.touches[0].clientY)}
                onTouchEnd={(e) => {
                  const touchEndY = e.changedTouches[0].clientY;
                  if (touchStartYRef.current !== null) {
                    if (touchStartYRef.current - touchEndY > 50) handleSwipeUp();
                    if (touchEndY - touchStartYRef.current > 50) handleSwipeDown();
                  }
                  touchStartYRef.current = null;
                }}
              >
                <OptimizedImage
                  src={metadata.url}
                  alt={metadata.alt || alt}
                  fill
                  className="object-contain"
                  placeholder={blur ? 'blur' : 'empty'}
                  blurDataURL={blur}
                />

                {!showInfo && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
                    {getIcon("arrow-down", 24)}
                  </div>
                )}
              </div>

              {/* Lato metadati */}
              {(showInfo || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                <div className="w-full md:w-1/3 flex flex-col justify-center p-6 overflow-y-auto space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t("dimentions")}</h2>
                    <div className='space-x-2 space-y-2'>
                      <InfoTag icon={getIcon("ratio", iconSize)} value={`${metadata.metadata.width}×${metadata.metadata.height}px`} />
                      {metadata.metadata.dpi && (
                        <InfoTag icon={getIcon("dpi", iconSize)} value={metadata.metadata.dpi.join(' × ')} />
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t("settings")}</h2>
                    <div className='space-x-2 space-y-2'>
                      {exif.aperture && exif.aperture !== '' && (
                        <InfoTag icon={getIcon("aperture", iconSize)} value={exif.aperture} />
                      )}
                      {exif.exposure_time && exif.exposure_time !== '' && (
                        <InfoTag icon={getIcon("shutter-speed", iconSize)} value={exif.exposure_time+'s'} />
                      )}
                      {exif.iso && (
                        <InfoTag icon={getIcon("iso", iconSize)} value={exif.iso+' ISO'} />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t("camera")}</h2>
                    <div className="space-y-2 space-x-2">
                      {(exif.make || exif.model) && (
                        <InfoTag icon={getIcon("camera", iconSize)} value={[exif.make, exif.model].filter(Boolean).join(' - ')} />
                      )}
                      {exif.lens_model && exif.lens_model !== '' && (
                        <InfoTag icon={getIcon("lens", iconSize)} value={exif.lens_model} />
                      )}
                    </div>  
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t("other")}</h2>
                    <div className="flex flex-wrap gap-2">
                      {exif.datetime_original && exif.datetime_original !== '' && (
                        <InfoTag
                          icon={getIcon("date", iconSize)}
                          value={format(parseExifDate(exif.datetime_original), 'dd/MM/yyyy HH:mm')}
                        />
                      )}
                      {(exif.gps && exif.gps.latitude && exif.gps.longitude) && (
                        <InfoTag
                          icon={getIcon("location", iconSize)}
                          value={`${exif.gps.latitude}, ${exif.gps.longitude}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
