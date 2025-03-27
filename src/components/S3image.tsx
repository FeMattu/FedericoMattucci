'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type ImageMetadata = {
  url: string;
  blurUrl?: string;
  name: string | null;
  alt: string;
  width: string | number | null;
  height: string | number | null;
  type: string | null;
  exif: string | null;
};

type Props = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
};

export default function S3Image({ src, alt = '', width = undefined, height = undefined, className = '' }: Props) {
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [highResLoaded, setHighResLoaded] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      const res = await fetch(`/api/image?key=${encodeURIComponent(src)}`);
      const data = await res.json();
      setMetadata(data);
    };

    fetchMetadata();
  }, [src]);

  if (!metadata) {
    return <div className="bg-gray-200 animate-pulse h-64 w-full rounded-xl" />;
  }

  // Imposta le dimensioni dinamiche: se non disponibili usa valori di default
  const imageWidth = width ? width : metadata.width ? parseInt(metadata.width as string, 10) : 1000;
  const imageHeight = height ? height : metadata.height ? parseInt(metadata.height as string, 10) : 250;

  return (
    <div className={`relative ${className}`}>
      {/* Versione blur come background */}
      {metadata.blurUrl && (
        <Image
          src={metadata.blurUrl}
          alt={metadata.alt || alt}
          width={imageWidth}
          height={imageHeight}
          className="shadow absolute inset-0 transition-opacity duration-300"
          style={{ filter: 'blur(20px)', opacity: highResLoaded ? 0 : 1 }}
          loading="eager"
        />
      )}

      {/* Immagine ad alta qualità */}
      <Image
        src={metadata.url}
        alt={metadata.alt || alt}
        width={imageWidth}
        height={imageHeight}
        className={className}
        loading="lazy"
        onLoad={() => setHighResLoaded(true)}
      />
    </div>
  );
}

