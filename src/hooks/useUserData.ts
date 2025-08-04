// src/hooks/useUserData.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "./useTranslationsSafe";
import { useCache } from "@/providers/CacheProvider";
import ParseUserData from "@/lib/parsers/UserDataParser";
import type UserData from "@/lib/interfaces/UserData";
import { devLog } from "@/lib/utils/utils";

export function useUserData(locale: string) {
  const [data, setData] = useState<UserData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslation();
  const { getCache, setCache } = useCache();
  
  // Ref per mantenere i dati raw e evitare fetch multipli
  const rawDataRef = useRef<any>(null);
  const currentLocaleRef = useRef<string | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Chiavi cache per i diversi tipi di dati
  const getRawDataCacheKey = useCallback((locale: string) => `raw_profile_data_${locale}`, []);
  const getParsedDataCacheKey = useCallback((locale: string) => `parsed_profile_data_${locale}`, []);

  const processData = useCallback((rawData: any, locale: string, translationFn: any) => {
    if (isProcessingRef.current) return;

    try {
      isProcessingRef.current = true;
      devLog(`Parsing data for locale: ${locale}`);
      const parsedData = ParseUserData(rawData, translationFn);
      setData(parsedData);
      devLog(`Data parsed successfully for locale: ${locale}`, parsedData);
      setError(null);
      
      // Salva i dati parsati in cache
      setCache(getParsedDataCacheKey(locale), parsedData);
    } catch (err) {
      console.error("Error parsing user data:", err);
      setError(err instanceof Error ? err : new Error("Parsing error"));
    } finally {
      isProcessingRef.current = false;
    }
  }, [setCache, getParsedDataCacheKey]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      const translator = t; // salva localmente per evitare trigger
      const rawCacheKey = getRawDataCacheKey(locale);
      const parsedCacheKey = getParsedDataCacheKey(locale);

      try {
        setLoading(true);
        setError(null);

        // 1. Prima controlla se abbiamo già i dati parsati in cache per questo locale
        const cachedParsedData = getCache<UserData>(parsedCacheKey);
        if (cachedParsedData) {
          devLog(`Using cached parsed data for locale: ${locale}`);
          setData(cachedParsedData);
          currentLocaleRef.current = locale;
          setLoading(false);
          return;
        }

        // 2. Se non abbiamo dati parsati, controlla se abbiamo i dati raw in cache
        let rawData = getCache<any>(rawCacheKey);
        if (rawData) {
          devLog(`Using cached raw data for locale: ${locale}`);
          rawDataRef.current = rawData;
          currentLocaleRef.current = locale;
          processData(rawData, locale, translator);
          setLoading(false);
          return;
        }

        // 3. Se non abbiamo niente in cache, fai il fetch
        devLog(`Fetching data for locale: ${locale}`);
        const response = await fetch(`/data/profile/${locale}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        rawData = await response.json();
        devLog(`Data fetched successfully for locale: ${locale}`, rawData);

        if (isMounted) {
          // Salva i dati raw in cache
          setCache(rawCacheKey, rawData);
          rawDataRef.current = rawData;
          currentLocaleRef.current = locale;
          processData(rawData, locale, translator);
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
  }, [locale, processData, getCache, setCache, getRawDataCacheKey, getParsedDataCacheKey, t]);

  // Effetto separato per gestire i cambiamenti di traduzione
  useEffect(() => {
    // Se abbiamo dati raw ma le traduzioni sono cambiate, riprocessa i dati
    if (rawDataRef.current && currentLocaleRef.current === locale) {
      console.log(`Reprocessing data due to translation change for locale: ${locale}`);
      processData(rawDataRef.current, locale, t);
    }
  }, [t, processData, locale]);

  return { data, error, loading };
}

