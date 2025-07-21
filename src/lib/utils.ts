import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TFunction } from "../hooks/useTranslation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanValue(t: TFunction, value: string, scope?: string): string {
  if (typeof value === 'string' && value.startsWith('_') && value.endsWith('_')) {
    // Se è un valore di escape, usa la traduzione
    const translationKey = value.slice(1, -1); // Rimuove gli underscore
    
    if (scope) {
      return t(`${scope}.${translationKey}`);
    } else {
      return t(translationKey);
    }
  }
  return value;
}

