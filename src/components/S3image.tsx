'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type ImageMetadata = {
  url: string;
  blurUrl?: string;
  alt: string;
  metadata: {
    width: number;
    height: number;
    exif: Record<string, any>;
  };
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

  return (
    <Image
      src={metadata.url}
      alt={metadata.alt || alt}
      width={imageWidth}
      height={imageHeight}
      className={className}
      priority
      placeholder="blur"
      blurDataURL={metadata.blurUrl}
    />
  );
}

