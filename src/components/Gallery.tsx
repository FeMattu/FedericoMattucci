"use client";

import { useEffect, useState, Suspense } from "react";
import Masonry from "react-masonry-css";
import S3Image from "./S3image";
import { useTranslations } from "next-intl";
import { useCache } from "@/providers/CacheProvider";
import ImagePrefetcher from "./ImagePrefetcher";
import { withPageCache } from "@/utils/withPageCache";

interface ImageItem {
  key: string;
  url: string;
  name?: string;
}

interface GalleryProps {
  path: string;
}

function Gallery({ path }: GalleryProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();
  const { setCache, getCache } = useCache();
  const cacheKey = `gallery:${path}`;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Verifica se le immagini sono già nella cache
        const cachedImages = getCache<ImageItem[]>(cacheKey);
        if (cachedImages) {
          setImages(cachedImages);
          setLoading(false);
          return;
        }

        // Altrimenti, recupera le immagini dall'API
        const res = await fetch(`/api/images-list?folder=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error('Errore nel fetch delle immagini');
        
        const data = await res.json();
        
        // Salva le immagini nella cache
        setCache(cacheKey, data.images);
        setImages(data.images);
      } catch (err) {
        console.error("Errore nel fetch delle immagini:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [path, cacheKey, setCache, getCache]);

  const breakpoints = {
    default: 4,
    1100: 3,
    768: 2,
    500: 1,
  };

  if (loading) return <p className="text-center">{t("fetch-images")}</p>;

  // Preparare gli URL per il prefetching
  const imageUrls = images.map(img => img.url);

  return (
    <ImagePrefetcher imageSources={imageUrls}>
      <Masonry
        breakpointCols={breakpoints}
        className="my-masonry-grid flex w-full"
        columnClassName="my-masonry-grid_column px-2"
      >
        {images.map((image) => (
          <div key={image.key} className="mb-4 break-inside-avoid">
            <Suspense fallback={<div className="h-60 bg-gray-100 dark:bg-gray-800 rounded-xl" />}>
              <S3Image
                src={image.key}
                alt={image.name ?? "immagine"}
                className="w-full h-auto rounded-xl shadow object-cover transition-transform duration-300 ease-in-out hover:scale-[1.02]"
              />
            </Suspense>
          </div>
        ))}
      </Masonry>
    </ImagePrefetcher>
  );
}

// Esporta il componente con funzionalità di caching della pagina
export default withPageCache(Gallery);
