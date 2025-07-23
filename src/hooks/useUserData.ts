// src/hooks/useUserData.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "./useTranslation";
import ParseUserData from "@/lib/parsers/UserDataParser";
import type UserData from "@/lib/interfaces/UserData";

export function useUserData(locale: string) {
  const [data, setData] = useState<UserData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslation();
  
  // Ref per mantenere i dati raw e evitare fetch multipli
  const rawDataRef = useRef<any>(null);
  const currentLocaleRef = useRef<string | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Funzione memoizzata per processare i dati
  const processData = useCallback((rawData: any, locale: string) => {
    if (isProcessingRef.current) return;
    
    try {
      isProcessingRef.current = true;
      console.log(`Parsing data for locale: ${locale}`);
      const parsedData = ParseUserData(rawData, t);
      setData(parsedData);
      console.log(`Data parsed successfully for locale: ${locale}`, parsedData);
      setError(null);
    } catch (err) {
      console.error("Error parsing user data:", err);
      setError(err instanceof Error ? err : new Error("Parsing error"));
    } finally {
      isProcessingRef.current = false;
    }
  }, [t]);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      // Se abbiamo già i dati per questo locale, processali con la nuova traduzione
      if (currentLocaleRef.current === locale && rawDataRef.current) {
        console.log(`Using cached data for locale: ${locale}`);
        processData(rawDataRef.current, locale);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching data for locale: ${locale}`);
        const response = await fetch(`/data/profile/${locale}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log(`Data fetched successfully for locale: ${locale}`, rawData);
        
        if (isMounted) {
          // Salva i dati raw e il locale corrente
          rawDataRef.current = rawData;
          currentLocaleRef.current = locale;
          
          // Processa i dati immediatamente
          processData(rawData, locale);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching user data:", err);
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [locale, processData]);

  return { data, error, loading };
}
