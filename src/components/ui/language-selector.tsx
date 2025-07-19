import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function LanguageSelector({className}: {className?: string}) {
    const pathname = usePathname(); // Percorso attuale
    const locale = useLocale(); // Lingua attuale
    return (
    <div className={className}>
        <Link 
            href={pathname} 
            locale="it" 
            className={`cursor-pointer ${locale === "it" ? "text-blue-600 font-bold" : "hover:text-gray-950 hover:font-medium dark:hover:text-white dark:hover:font-medium"}`}
        >
            IT
        </Link>
        <span className="text-gray-300 dark:text-white-400">|</span>
        <Link 
            href={pathname} 
            locale="en" 
            className={`cursor-pointer ${locale === "en" ? "text-blue-600 font-bold" : "hover:text-gray-950 hover:font-medium dark:hover:text-white dark:hover:font-medium"}`}
        >
            EN
        </Link>
    </div>
    )
}