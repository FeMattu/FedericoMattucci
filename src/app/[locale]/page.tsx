import { Link } from "@/i18n/navigation";
import { Earth, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

function LanguageTag({ language }: { language: string }) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-2 bg-gray-200 dark:bg-black border border-gray-400 dark:border-gray-600 rounded-full px-4 py-1 text-lg font-semibold">
      <p>{t(language)}</p>
    </div>
  );
}

function SocialButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all w-fit"
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-x-40">
        
        <div className="sticky top-0 flex flex-col items-center gap-6 text-center">
          <Image
            src="/images/homepage/entire.jpg"
            alt="Federico Mattucci"
            width={250}
            height={250}
            className="rounded-full object-top object-cover border border-gray-300 dark:border-gray-700 aspect-square overflow-hidden"
          />

          <div className="flex items-center gap-4 text-lg font-semibold">
            <Earth size={32} />
            <p>Lucca - {t("tuscany")} - {t("italy")}</p>
          </div>

          <div className="flex gap-4">
            <LanguageTag language="it" />
            <LanguageTag language="en" />
          </div>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold">Federico Mattucci</h1>
          <p className="mt-4 text-2xl text-gray-600 dark:text-gray-400">
            {t("job-title")}
          </p>
          <div className="flex flex-row gap-6 mt-10">
            <SocialButton href="https://www.instagram.com/fede_mattu_?igsh=eTBndmF1bGswNTVi">
              <Instagram size={24} />
              <p>Instagram</p>
            </SocialButton>
            <SocialButton href="https://www.linkedin.com/in/federico-mattucci-13aa1a249?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">
              <Linkedin size={24} />
              <p>LinkedIn</p>
            </SocialButton>
            <SocialButton href="https://github.com/federico-mattucci">
              <Github size={24} />
              <p>GitHub</p>
            </SocialButton>
            <SocialButton href="mailto:federico.mattucci@example.com">
              <Mail size={24} />
              <p>Email</p>
            </SocialButton>
          </div>
          <p className="mt-20 max-w-xl text-wrap text-lg">
            {t("self-description")}
          </p>
        </div>

      </div>
    </div>
  );
}
