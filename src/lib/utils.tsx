import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import UserData from "./interfaces/UserData"
import ParseUserData from "./parsers/UserDataParser"
import { useTranslation } from "./translation"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanValue(value: string, scope?: string): string {
  if (typeof value === 'string' && value.startsWith('_') && value.endsWith('_')) {
    // Se è un valore di escape, usa la traduzione
    const t = useTranslation();
    const translationKey = value.slice(1, -1); // Rimuove gli underscore
    
    if (scope) {
      return t(`${scope}.${translationKey}`);
    } else {
      return t(translationKey);
    }
  }
  return value;
}

export async function getUserData(locale: string): Promise<UserData> {
  // Carica i dati JSON dal file profile
  const response = await fetch(`/data/profile/${locale}.json`)
  if (!response.ok) {
    throw new Error('Failed to fetch user data')
  }
  
  const rawData = await response.json()
  
  // Utilizza il parser per convertire i dati grezzi in UserData tipizzato
  return ParseUserData(rawData, locale)
}

