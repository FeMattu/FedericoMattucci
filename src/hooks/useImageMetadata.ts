"use client";

import { useState, useCallback } from 'react';
import { extractFullImageMetadata, FullImageMetadata } from '@/lib/utils/extractImageMetadata';

export function useImageMetadata() {
  const [metadata, setMetadata] = useState<FullImageMetadata | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const processImage = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const meta = await extractFullImageMetadata(file);
      setMetadata(meta);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { metadata, error, loading, processImage };
}
