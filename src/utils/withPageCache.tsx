'use client';

import { usePathname } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
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

    // Effetto per gestire lo scroll ripristinando la posizione precedente
    useEffect(() => {
      // Recupera la posizione di scroll precedente dalla cache
      const cachedScrollPosition = getCache(`${pageKey}:scrollPosition`);
      
      if (cachedScrollPosition) {
        // Ripristina la posizione dello scroll
        window.scrollTo(0, Number(cachedScrollPosition));
      }
      
      // Salva la posizione dello scroll quando l'utente lascia la pagina
      const handleScroll = () => {
        setCache(`${pageKey}:scrollPosition`, window.scrollY);
      };
      
      // Aggiungi un listener per l'evento scroll
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        // Rimuovi il listener quando il componente viene smontato
        window.removeEventListener('scroll', handleScroll);
        
        // Salva la posizione finale dello scroll
        setCache(`${pageKey}:scrollPosition`, window.scrollY);
      };
    }, [pageKey, setCache, getCache]);

    return <Component {...props} />;
  };
}
