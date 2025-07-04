'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CacheContextType {
  cachedData: Record<string, any>;
  setCache: (key: string, data: any) => void;
  getCache: (key: string) => any;
  clearCache: (key?: string) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cachedData, setCachedData] = useState<Record<string, any>>({});

  // Salva dati nella cache
  const setCache = useCallback((key: string, data: any) => {
    setCachedData(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
    
    // Opzionalmente, salva nella localStorage per persistenza tra sessioni
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, []);

  // Recupera dati dalla cache
  const getCache = useCallback((key: string) => {
    // Prima controlla la cache in memoria
    if (cachedData[key]) {
      return cachedData[key].data;
    }
    
    // Se non trovato, prova localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedItem = localStorage.getItem(`cache_${key}`);
        if (storedItem) {
          const parsed = JSON.parse(storedItem);
          
          // Aggiorna la cache in memoria
          setCachedData(prev => ({
            ...prev,
            [key]: parsed
          }));
          
          return parsed.data;
        }
      } catch (e) {
        console.error('Error retrieving from localStorage:', e);
      }
    }
    
    return null;
  }, [cachedData]);

  // Pulisce la cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      setCachedData(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`cache_${key}`);
      }
    } else {
      setCachedData({});
      
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith('cache_')) {
            localStorage.removeItem(storageKey);
          }
        });
      }
    }
  }, []);

  return (
    <CacheContext.Provider value={{ cachedData, setCache, getCache, clearCache }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}
