'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState, useEffect, useCallback } from 'react';
import { useCache } from '@/providers/CacheProvider';

interface UseSmartNavigationReturn {
  isLoading: boolean;
  navigateTo: (href: string) => void;
  setPageData: <T>(key: string, data: T) => void;
  getPageData: <T>(key: string) => T | null;
}

/**
 * Custom hook per gestire la navigazione con cache e transizioni fluide
 */
export function useSmartNavigation(): UseSmartNavigationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const { setCache, getCache } = useCache();

  // Funzione per navigare con transizione fluida
  const navigateTo = useCallback((href: string) => {
    setIsLoading(true);
    
    // Usa le transizioni React per rendere la navigazione più fluida
    startTransition(() => {
      router.push(href);
    });
  }, [router]);

  // Salva i dati di una pagina nella cache
  const setPageData = useCallback(function<T>(key: string, data: T): void {
    // Crea una chiave specifica per la pagina corrente
    const pageKey = `${pathname}:${key}`;
    setCache(pageKey, data);
  }, [pathname, setCache]);

  // Recupera i dati di una pagina dalla cache
  const getPageData = useCallback(function<T>(key: string): T | null {
    // Recupera i dati usando la chiave specifica per la pagina
    const pageKey = `${pathname}:${key}`;
    return getCache<T>(pageKey);
  }, [pathname, getCache]);

  // Resetta lo stato di caricamento quando la transizione è completata
  useEffect(() => {
    if (!isPending) {
      setIsLoading(false);
    }
  }, [isPending]);

  return {
    isLoading,
    navigateTo,
    setPageData,
    getPageData
  };
}
