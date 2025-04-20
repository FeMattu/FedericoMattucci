'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import getIcon from '@/utils/IconMap';
import { useTranslations } from "next-intl";
import { format } from 'date-fns';

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
    exif: Record<string, unknown>;
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
  const t = useTranslations();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/image?filename=${encodeURIComponent(src)}`);
        if (!res.ok) throw new Error('Impossibile caricare metadati');
        const data = await res.json();
        setMetadata(data);
      } catch (error) {
        console.error('Errore nel caricamento metadati:', error);
      }
    };

    fetchMetadata();
  }, [src]);

  if (!metadata) {
    return <div className="bg-gray-200 animate-pulse h-64 w-full rounded-xl" />;
  }

  const imageWidth = width ?? metadata.metadata?.width ?? 1000;
  const imageHeight = height ?? metadata.metadata?.height ?? 250;
  const blur = metadata.metadata?.blurDataUrl;
  const exif = metadata.metadata.exif ?? {};
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
      <Image
        src={metadata.url}
        alt={metadata.alt || alt}
        width={imageWidth}
        height={imageHeight}
        className={`${className} ${lightbox ? 'cursor-zoom-in' : ''}`}
        priority
        placeholder={blur ? 'blur' : 'empty'}
        blurDataURL={blur}
        onClick={lightbox ? () => setIsOpen(true) : undefined}
      />

      <AnimatePresence>
        {lightbox && isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <div className="text-black dark:text-white rounded-xl shadow-lg max-w-7xl w-full h-[90vh] flex flex-col md:flex-row overflow-hidden backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
              {/* Bottone chiusura */}
              <button
                className="absolute top-4 right-4 z-10 bg-transparent hover:scale-110 transition-transform"
                onClick={() => setIsOpen(false)}
                aria-label="Chiudi lightbox"
              >
                {getIcon("close-menu-mobile", 24)}
              </button>

              {/* Lato immagine */}
              <div className="flex-1 relative h-1/2 md:h-full">
                <Image
                  src={metadata.url}
                  alt={metadata.alt || alt}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Lato metadati */}
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
                      <InfoTag icon={getIcon("shutter-speed", iconSize)} value={exif.exposure_time} />
                    )}
                    {exif.iso && (
                      <InfoTag icon={getIcon("iso", iconSize)} value={exif.iso} />
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
                    {exif.datetime_original && exif.datetime_original !== '' && (
                      <InfoTag icon={getIcon("date", iconSize)} value={exif.datetime_original} />
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
