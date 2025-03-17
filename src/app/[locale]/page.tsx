import SkillsTag from "@/components/SkillsTags";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Earth, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

function LanguageTag({ language }: { language: string }) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 border border-gray-400 dark:border-gray-700 rounded-full px-4 py-1 text-lg font-semibold">
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

function HobbieCard({ hobby , description}: { hobby: string, description:string }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col">
      <div className='flex items-start gap-4'>
          <h1 className='text-2xl font-bold text-left'>
              {t(hobby)}
          </h1>
      </div>
      <p className="text-left">
          {t(description)}
      </p>
    </div> 
  );
}


export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col mt-10 md:flex-row items-start justify-center w-full gap-x-40">
        
        <div className="sticky top-10 flex flex-col items-center gap-6 text-center">
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

        <div className="text-center md:text-left max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold">Federico Mattucci</h1>
          <p className="mt-4 text-2xl text-gray-600 dark:text-gray-400">
            {t("job-title")}
          </p>
          <div className="flex flex-row gap-6 mt-6">
            <SocialButton href="https://www.instagram.com/fede_mattu_?igsh=eTBndmF1bGswNTVi">
              <Instagram size={24} />
              <p>Instagram</p>
            </SocialButton>
            <SocialButton href="https://www.linkedin.com/in/federico-mattucci-13aa1a249?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">
              <Linkedin size={24} />
              <p>LinkedIn</p>
            </SocialButton>
            <SocialButton href="https://github.com/FeMattu">
              <Github size={24} />
              <p>GitHub</p>
            </SocialButton>
            <SocialButton href="mailto:mattucci.federico@gmail.com">
              <Mail size={24} />
              <p>Email</p>
            </SocialButton>
          </div>
          <p className="mt-15 text-wrap text-lg">
            {t("self-description")}
          </p>
          <div className="mt-10">
            <h1 className="text-4xl font-bold">
              {t("studies-title")}
            </h1>
            <div className="flex-col">
              <h2 className="mt-4 text-2xl font-semibold">
                {t("studies-high-school-name")}
              </h2>
              <p className="text-lg">
                {t("studies-high-school-description")}
              </p>
            </div>
            <div className="flex-col">
              <h2 className="mt-4 text-2xl font-semibold">
                {t("studies-university-name")}
              </h2>
              <p className="text-lg">
                {t("studies-university-description")}
              </p>
            </div>
          </div>
          <div className="mt-10">
            <h1 className="text-4xl font-bold">
              {t("skills-title")}
            </h1>
            <div className="flex-col">
              <h2 className="mt-4 text-2xl font-semibold">
                {t("skills-programming-languages")}
              </h2>
              <SkillsTag JSONfile="/data/programming-languages.json" className="mt-3 flex-wrap"/>
            </div>
            <div className="flex-col">
              <h2 className="mt-4 text-2xl font-semibold">
                {t("skills-technologies")}
              </h2>
              <SkillsTag JSONfile="/data/computer-skills.json" className="mt-3 flex-wrap"/>
            </div>
          </div>
          <div className="mt-10">
            <h1 className="text-4xl font-bold">
              {t("hobbies-title")}
            </h1>
            <p className="mt-4 text-lg">
              {t("hobbies-description")}
            </p>
            <div className="group flex flex-col gap-4 mt-4 mt-4">
              <HobbieCard hobby="hobby-technologies" description="hobby-description-technologies" />
              <HobbieCard hobby="hobby-cooking" description="hobby-description-cooking" />
              <HobbieCard hobby="hobby-sports" description="hobby-description-sports" />
              <HobbieCard hobby="hobby-travel" description="hobby-description-travel" />
              <Link href="/portfolio" className="group relative flex flex-row items-start gap-4 hover:bg-gray-200 hover:dark:bg-black/20 rounded-lg transition cursor-pointer">
                <ArrowUpRight className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex flex-col">
                  <div className="flex items-start gap-4">
                    <h1 className="text-2xl font-bold text-left">
                      {t("hobby-photography")}
                    </h1>
                  </div>
                  <p className="text-left">
                    {t("hobby-description-photography")}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
