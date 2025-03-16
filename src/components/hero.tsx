import { Link } from "@/i18n/navigation";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Hero() {
  const t = useTranslations();
  return (
    <section className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl mx-auto py-16 px-6">
      <div className="w-full md:w-1/2 text-left">
        <h1 className="text-4xl font-bold text-blue-900">Federico Mattucci</h1>
        <p className="mt-4 text-lg items-center">
          {t('hero-description')}
        </p>
        <div className="mt-6 flex gap-4 justify-center md:justify-start">
          <Link href="/cv.pdf" className="button bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800">
            CV
          </Link>
          <Link href="/portfolio" className="button bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800">
            Portfolio
          </Link>
        </div>
        <div className="mt-6 flex gap-4 justify-center md:justify-start">
          <Link href="#" className="text-gray-700 hover:text-black">
            <Facebook />
          </Link>
          <Link href="#" className="text-gray-700 hover:text-black">
            <Linkedin />
          </Link>
          <Link href="#" className="text-gray-700 hover:text-black">
            <Instagram />
          </Link>
        </div>
      </div>

      <div className="relative w-full md:w-3/4 h-screen">
        <Image 
          src="/images/homepage/entire.jpg" 
          alt="Federico Mattucci" 
          fill
          className="rounded-2xl object-cover"
        />
      </div>
    </section>
  );
};
