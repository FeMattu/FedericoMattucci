"use client";

import { useEffect, useState, Suspense } from "react";
import Masonry from "react-masonry-css";
import S3Image from "./S3image";

interface GalleryProps {
  path: string;
}

export default function Gallery({ path }: GalleryProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/images-list?path=${encodeURIComponent(path)}`);
        const data = await res.json();
        setImages(data);
      } catch (err) {
        console.error("Errore nel fetch delle immagini:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [path]);

  const breakpoints = {
    default: 4,
    1100: 3,
    768: 2,
    500: 1,
  };

  if (loading) return <p className="text-center">Caricamento immagini...</p>;

  return (
    <Masonry
      breakpointCols={breakpoints}
      className="flex gap-4 w-full justify-center"
      columnClassName="masonry-column p-4"
    >
      {images.map((src) => (
        <Suspense fallback={<div className="h-60 bg-gray-100" />} key={src}>
          <S3Image
            src={src}
            alt={src.split("/").pop() ?? "immagine"}
            className="object-cover w-full h-full mb-4 rounded-xl shadow"
          />
        </Suspense>
      ))}
    </Masonry>
  );
}
