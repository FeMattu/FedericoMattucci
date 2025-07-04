'use client';

import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSmartNavigation } from "@/hooks/useSmartNavigation";
import { useCallback } from "react";

export default function LanguageSelector({className}: {className?: string}) {
    const pathname = usePathname(); // Percorso attuale
    const locale = useLocale(); // Lingua attuale
    const { navigateTo, isLoading } = useSmartNavigation();

    // Funzione per cambiare lingua senza ricaricare completamente la pagina
    const changeLanguage = useCallback((newLocale: string) => {
        // Crea il nuovo percorso con la lingua aggiornata
        const segments = pathname.split('/');
        segments[1] = newLocale; // Il segmento della lingua è il secondo (dopo lo slash iniziale)
        const newPath = segments.join('/');
        
        // Naviga senza ricaricare completamente
        navigateTo(newPath);
    }, [pathname, navigateTo]);

    return (
        <div className={className}>
            <button 
                onClick={() => changeLanguage('it')}
                disabled={isLoading || locale === 'it'}
                className={`cursor-pointer ${
                    locale === "it" 
                        ? "text-blue-600 font-bold" 
                        : "hover:text-gray-950 hover:font-medium dark:hover:text-white dark:hover:font-medium"
                } ${isLoading ? 'opacity-50' : ''}`}
            >
                IT
            </button>
            <span className="text-gray-300 dark:text-white-400">|</span>
            <button 
                onClick={() => changeLanguage('en')}
                disabled={isLoading || locale === 'en'}
                className={`cursor-pointer ${
                    locale === "en" 
                        ? "text-blue-600 font-bold" 
                        : "hover:text-gray-950 hover:font-medium dark:hover:text-white dark:hover:font-medium"
                } ${isLoading ? 'opacity-50' : ''}`}
            >
                EN
            </button>
        </div>
    );
}