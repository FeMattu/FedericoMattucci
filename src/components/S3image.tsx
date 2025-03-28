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
    <Image
      src={metadata.url}
      alt={metadata.alt || alt}
      width={imageWidth}
      height={imageHeight}
      className={className}
      priority
      placeholder='blur'
      blurDataURL={metadata.blurUrl}
    />
  );
}

