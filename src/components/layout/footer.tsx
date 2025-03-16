import { useTranslations } from "next-intl";
import Logo from "./logo";
import { Link } from "@/i18n/navigation";

export default function Footer() {
    const t = useTranslations();

    return (
        <footer className="w-full flex flex-col py-4 justify-center items-center">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <div className="flex items-center gap-4">
                <Logo />
            </div>
            <nav className="flex gap-6">
                <Link href="/" className="hover:font-bold">
                    {t("portfolio")}
                </Link>
                <Link href="/" className="hover:font-bold">
                    {t("contact")}
                </Link>
            </nav>
        </div>
        <div className="w-full text-center text-sm mt-4">
            <p>© {new Date().getFullYear()} - All rights reserved</p>
        </div>
    </footer>

    );
}
