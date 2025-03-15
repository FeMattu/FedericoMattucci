'use client'

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react"; // Icone per il menu
import LanguageSelector from "./language-selector";
import Logo from "./logo";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations(); // Per le traduzioni

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Logo />
        <div className="hidden md:flex gap-6">
          <Link href="/portfolio" className="text-gray-700 hover:text-blue-600">{t('portfolio')}</Link>
          <Link href="/contacts" className="text-gray-700 hover:text-blue-600">{t('contact')}</Link>
        </div>

        <LanguageSelector className="hidden md:flex gap-2 border border-gray-300 rounded-lg px-3 py-1" />

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-md absolute w-full left-0">
          <div className="flex flex-col items-center gap-4 py-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600">{t("home")}</Link>
            <Link href="/portfolio" className="text-gray-700 hover:text-blue-600">{t("portfolio")}</Link>
            <Link href="/contatacts" className="text-gray-700 hover:text-blue-600">{t("contatti")}</Link>
            <LanguageSelector className="flex gap-4 mt-4 border border-gray-300 rounded-lg px-3 py-1" />
          </div>
        </div>
      )}
    </nav>
  );
};

