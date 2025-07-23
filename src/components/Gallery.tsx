"use client";

import { useEffect, useState, Suspense } from "react";
import Masonry from "react-masonry-css";
import S3Image from "./S3image";
import { useTranslations } from "next-intl";

interface GalleryProps {
  path: string;
}

export default function Gallery({ path }: GalleryProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations()

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

  if (loading) return <p className="text-center">{t("loading.images")}</p>;

  return (
    <Masonry
      breakpointCols={breakpoints}
      className="my-masonry-grid flex w-full"
      columnClassName="my-masonry-grid_column px-2"
    >
      {images.map((src) => (
        <div key={src} className="mb-4 break-inside-avoid">
          <Suspense fallback={<div className="h-60 bg-gray-100 rounded-xl" />}>
            <S3Image
              src={src}
              alt={src.split("/").pop() ?? "immagine"}
              className="w-full h-auto rounded-xl shadow object-cover transition-transform duration-300 ease-in-out hover:scale-[1.02]"
            />
          </Suspense>
        </div>
      ))}
    </Masonry>
  );
}
