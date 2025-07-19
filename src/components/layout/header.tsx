'use client'

import { useState } from "react";
import { useTranslation } from "@/lib/translation";
import { Link } from "@/i18n/navigation";
import LanguageSelector from "../ui/language-selector";
import Logo from "../ui/logo";
import DarkModeToggle from "../ui/darkmode-selector";
import getIcon from "@/lib/IconMap";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslation();

  return (
    <nav className="sticky w-full z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Logo />
        
        <div className="hidden md:flex gap-6">
          <Link href="/portfolio" className="hover:font-bold">{t('pages.portfolio.default')}</Link>
          <Link href="/contacts" className="hover:font-bold">{t('pages.contact.default')}</Link>
        </div>

        <div className="flex gap-6 items-center">
          <DarkModeToggle />
          <LanguageSelector className="hidden md:flex gap-2 border border-gray-300 rounded-lg px-3 py-1" />
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">
          {isOpen ? getIcon("close-menu-mobile") : getIcon("menu-mobile")}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-screen z-50 bg-white/97 dark:bg-black/90 backdrop-blur-md px-6">
          <div className="flex justify-end pt-6">
            <button onClick={() => setIsOpen(false)} className="text-gray-700">
              {getIcon("close-menu-mobile")}
            </button>
          </div>
          <div className="flex flex-col items-center gap-6 mt-10 text-xl font-semibold">
            <Link href="/" className="hover:text-blue-600" onClick={() => setIsOpen(false)}>{t("home")}</Link>
            <Link href="/portfolio" className="hover:text-blue-600" onClick={() => setIsOpen(false)}>{t("portfolio")}</Link>
            <Link href="/contacts" className="hover:text-blue-600" onClick={() => setIsOpen(false)}>{t("contact")}</Link>
            <LanguageSelector className="flex gap-4 mt-4 border border-gray-300 rounded-lg px-3 py-1" />
          </div>
        </div>
      )}
    </nav>
  );
};

