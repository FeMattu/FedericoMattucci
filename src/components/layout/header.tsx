'use client'

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSelector from "./language-selector";
import Logo from "./logo";
import DarkModeToggle from "./darkmode-selector";
import getIcon from "@/utils/IconMap";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations(); // Per le traduzioni

  return (
    <nav className="sticky w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Logo />
        <div className="hidden md:flex gap-6">
          <Link href="/portfolio" className="hover:font-bold">{t('portfolio')}</Link>
          <Link href="/contacts" className="hover:font-bold">{t('contact')}</Link>
        </div>
        <div className="flex gap-6 items-center">
          <DarkModeToggle />
          <LanguageSelector className="hidden md:flex gap-2 border border-gray-300 rounded-lg px-3 py-1" />  
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">
          {isOpen ?  getIcon("close-menu-mobile", 28) : getIcon("menu-mobile", 28)}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-md absolute w-full left-0">
          <div className="flex flex-col items-center gap-4 py-4">
            <Link href="/" className="hover:text-blue-600">{t("home")}</Link>
            <Link href="/portfolio" className="hover:text-blue-600">{t("portfolio")}</Link>
            <Link href="/contatacts" className="hover:text-blue-600">{t("contatti")}</Link>
            <LanguageSelector className="flex gap-4 mt-4 border border-gray-300 rounded-lg px-3 py-1" />
          </div>
        </div>
      )}
    </nav>
  );
};

