'use client';

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSmartNavigation } from "@/hooks/useSmartNavigation";
import { useCallback, useEffect, useState } from "react";
import { useCache } from "@/providers/CacheProvider";

export default function LanguageSelector({className}: {className?: string}) {
    const pathname = usePathname(); // Percorso attuale
    const locale = useLocale(); // Lingua attuale
    const { navigateTo, isLoading } = useSmartNavigation();
    const { setCache } = useCache();
    const [preventScroll, setPreventScroll] = useState(false);
    
    // Memorizza la posizione di scroll prima di cambiare lingua
    useEffect(() => {
        if (preventScroll) {
            const currentPath = pathname.split('/').slice(2).join('/');
            setCache(`scrollPos:${currentPath}`, window.scrollY);
            setPreventScroll(false);
        }
    }, [preventScroll, pathname, setCache]);

    // Funzione per cambiare lingua senza ricaricare completamente la pagina
    const changeLanguage = useCallback((newLocale: string) => {
        // Salva la posizione di scroll corrente
        setPreventScroll(true);
        
        // Crea il nuovo percorso con la lingua aggiornata
        const segments = pathname.split('/');
        const currentPath = segments.slice(2).join('/'); // Estrai il percorso senza la lingua
        
        // Costruisci il nuovo URL con la nuova lingua
        const newPath = `/${newLocale}/${currentPath}`;
        
        // Naviga senza ricaricare completamente
        navigateTo(newPath);
    }, [pathname, navigateTo]);

    return (
        <div className={className}>
            <Link
                href={`/it/${pathname.split('/').slice(2).join('/')}`}
                onClick={(e) => {
                    if (isLoading || locale === 'it') {
                        e.preventDefault();
                        return;
                    }
                    e.preventDefault();
                    changeLanguage('it');
                }}
                className={`${
                    locale === "it" 
                        ? "text-blue-600 font-bold" 
                        : "hover:text-gray-950 hover:font-medium dark:hover:text-white dark:hover:font-medium"
                } ${isLoading ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
            >
                IT
            </Link>
            <span className="text-gray-300 dark:text-white-400 mx-2">|</span>
            <Link
                href={`/en/${pathname.split('/').slice(2).join('/')}`}
                onClick={(e) => {
                    if (isLoading || locale === 'en') {
                        e.preventDefault();
                        return;
                    }
                    e.preventDefault();
                    changeLanguage('en');
                }}
                className={`${
                    locale === "en" 
                        ? "text-blue-600 font-bold" 
                        : "hover:text-gray-950 hover:font-medium dark:hover:text-white dark:hover:font-medium"
                } ${isLoading ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
            >
                EN
            </Link>
        </div>
    );
}