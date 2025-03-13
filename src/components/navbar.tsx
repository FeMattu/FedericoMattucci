'use client'

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react"; // Icone per il menu

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations(); // Per le traduzioni
  const locale = useLocale(); // Lingua attuale
  const pathname = usePathname(); // Percorso attuale

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-900">
          Federico Mattucci
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex gap-6">
          <Link href="/esperienze" className="text-gray-700 hover:text-blue-600">{t('experience')}</Link>
          <Link href="/portfolio" className="text-gray-700 hover:text-blue-600">{t('portfolio')}</Link>
          <Link href="/contatti" className="text-gray-700 hover:text-blue-600">{t('contact')}</Link>
        </div>

        {/* Selettore Lingua */}
        <div className="hidden md:flex gap-2 border border-gray-300 rounded-lg px-3 py-1">
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

        {/* Icona Hamburger per Mobile */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-md absolute w-full left-0">
          <div className="flex flex-col items-center gap-4 py-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600">{t("home")}</Link>
            <Link href="/esperienze" className="text-gray-700 hover:text-blue-600">{t("esperienze")}</Link>
            <Link href="/portfolio" className="text-gray-700 hover:text-blue-600">{t("portfolio")}</Link>
            <Link href="/contatti" className="text-gray-700 hover:text-blue-600">{t("contatti")}</Link>

            {/* Selettore Lingua Mobile */}
            <div className="flex gap-4 mt-4 border border-gray-300 rounded-lg px-3 py-1">
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

