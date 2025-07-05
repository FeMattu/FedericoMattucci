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
    
    // Salva la posizione di scroll corrente
    const currentPath = pathname;
    setCache(`navigation:${currentPath}`, {
      scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
      timestamp: Date.now()
    });
    
    // Usa le transizioni React per rendere la navigazione più fluida
    startTransition(() => {
      router.push(href);
    });
  }, [router, pathname, setCache]);

  // Ripristina la posizione di scroll se necessario
  useEffect(() => {
    if (!isPending && pathname) {
      // Resetta lo stato di caricamento
      setIsLoading(false);
      
      // Controlla se c'è una posizione di scroll da ripristinare
      const savedData = getCache<{scrollY: number, timestamp: number}>(`scrollPos:${pathname.split('/').slice(2).join('/')}`);
      if (savedData && Date.now() - savedData.timestamp < 5000) {
        // Ripristina la posizione solo se il dato è recente (meno di 5 secondi)
        window.setTimeout(() => {
          window.scrollTo(0, savedData.scrollY);
        }, 0);
      }
    }
  }, [isPending, pathname, getCache]);

  // Salva i dati di una pagina nella cache
  const setPageData = useCallback(function<T>(key: string, data: T): void {
    // Crea una chiave specifica per la pagina corrente
    const pageKey = `${pathname}:${key}`;
    setCache<T>(pageKey, data);
  }, [pathname, setCache]);

  // Recupera i dati di una pagina dalla cache
  const getPageData = useCallback(function<T>(key: string): T | null {
    // Recupera i dati usando la chiave specifica per la pagina
    const pageKey = `${pathname}:${key}`;
    return getCache<T>(pageKey);
  }, [pathname, getCache]);

  return {
    isLoading,
    navigateTo,
    setPageData,
    getPageData
  };
}
