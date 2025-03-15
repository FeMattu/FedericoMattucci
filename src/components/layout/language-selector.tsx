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
            className={`cursor-pointer ${locale === "it" ? "text-blue-600 font-bold" : "text-gray-700"}`}
        >
            IT
        </Link>
        <span>|</span>
        <Link 
            href={pathname} 
            locale="en" 
            className={`cursor-pointer ${locale === "en" ? "text-blue-600 font-bold" : "text-gray-700"}`}
        >
            EN
        </Link>
    </div>
    )
}