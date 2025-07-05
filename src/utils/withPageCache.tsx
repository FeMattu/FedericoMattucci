'use client';

import { usePathname } from 'next/navigation';
import { useEffect, ComponentType, useState } from 'react';
import { useCache } from '@/providers/CacheProvider';

/**
 * HOC (Higher Order Component) che aggiunge funzionalità di caching a qualsiasi componente
 * @param Component Componente da avvolgere con funzionalità di caching
 * @param cacheKey Chiave opzionale per il caching
 * @returns Componente avvolto con funzionalità di caching
 */
export function withPageCache<P extends object>(
  Component: ComponentType<P>,
  cacheKey?: string
) {
  return function CachedComponent(props: P) {
    const pathname = usePathname();
    const { setCache, getCache } = useCache();
    const pageKey = cacheKey || `page:${pathname}`;
    const [isScrollRestored, setIsScrollRestored] = useState(false);

    // Effetto per gestire lo scroll ripristinando la posizione precedente
    useEffect(() => {
      if (typeof window === 'undefined') return;
      
      // Recupera la posizione di scroll precedente dalla cache
      const cachedScrollPosition = getCache<number>(`${pageKey}:scrollPosition`);
      
      if (cachedScrollPosition && !isScrollRestored) {
        // Ripristina la posizione dello scroll con un leggero ritardo
        // per consentire al DOM di renderizzare completamente
        const timer = setTimeout(() => {
          window.scrollTo({
            top: cachedScrollPosition,
            behavior: 'auto'
          });
          setIsScrollRestored(true);
        }, 100);
        
        return () => clearTimeout(timer);
      }
      
      // Registra il valore iniziale dello scroll
      if (!isScrollRestored) {
        setIsScrollRestored(true);
      }
      
      // Salva la posizione dello scroll quando l'utente scorre la pagina
      const handleScroll = () => {
        // Usa un debounce per non chiamare setCache troppo frequentemente
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            setCache(`${pageKey}:scrollPosition`, window.scrollY);
          });
        } else {
          setTimeout(() => {
            setCache(`${pageKey}:scrollPosition`, window.scrollY);
          }, 200);
        }
      };
      
      // Aggiungi un listener per l'evento scroll con throttling
      let scrollTimeout: number | undefined;
      const throttledScrollHandler = () => {
        if (scrollTimeout) return;
        scrollTimeout = window.setTimeout(() => {
          handleScroll();
          scrollTimeout = undefined;
        }, 100);
      };
      
      window.addEventListener('scroll', throttledScrollHandler, { passive: true });
      
      return () => {
        // Pulizia
        window.removeEventListener('scroll', throttledScrollHandler);
        if (scrollTimeout) clearTimeout(scrollTimeout);
        
        // Salva la posizione finale dello scroll
        setCache(`${pageKey}:scrollPosition`, window.scrollY);
      };
    }, [pageKey, setCache, getCache, isScrollRestored]);

    return <Component {...props} />;
  };
}
