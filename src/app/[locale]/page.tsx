import Image from "next/image";
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";

export default function HomePage() {
  const t = useTranslations();
  return (
    <div className="w-full h-full">
      <Navbar />
      <Hero />
    </div>
  );
}
