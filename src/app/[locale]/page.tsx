"use client"

import SkillsTags from "@/components/SkillsTags";
import { Link } from "@/i18n/navigation";
import { useTranslation } from "@/lib/translation";
import { useUserData } from "@/lib/utils";
import SocialButton from "@/components/SocialButton";
import getIcon from "@/lib/IconMap";
import S3Image from "@/components/S3image";

export default function HomePage() {
  const t = useTranslation();
  const userData = useUserData();

  if (!userData) {
    return (
      <div className="min-h-screen px-6 py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-[var(--text-secondary)]">{t('loading.user-info')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen px-4 sm:px-6 flex items-start justify-center">
      <div className="flex flex-col md:flex-row w-full gap-y-10 md:gap-x-10 lg:gap-x-40 mt-10">
        
        <div className="flex flex-col items-center text-center md:sticky top-10 md:text-left gap-6 sm:mb-10">
          <S3Image
            src={userData.image}
            alt={userData.fullname}
            lightbox={false}
            className="rounded-full w-[250px] h-[250px] object-cover border border-gray-300 dark:border-gray-700 overflow-hidden"
          />

          <div className="flex items-center gap-4 text-lg font-semibold">
            {getIcon("earth", 32)}
            <p>{userData.location.city} - {userData.location.region} - {userData.location.country}</p>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 border border-gray-400 dark:border-gray-700 rounded-full px-4 py-1 text-lg font-semibold">
              <p>{userData.languages.it}</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 border border-gray-400 dark:border-gray-700 rounded-full px-4 py-1 text-lg font-semibold">
              <p>{userData.languages.en}</p>
            </div>
          </div>
        </div>

        <div className="text-center md:text-left w-full max-w-2xl flex flex-col gap-10">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold">{userData.fullname}</h1>
            <p className="mt-4 text-2xl text-gray-600 dark:text-gray-400">
              {userData["job-title"]}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <SocialButton href={userData.social.instagram}>
                {getIcon("instagram", 24)}
                <p>{t("contatti.social.instagram")}</p>
              </SocialButton>
              <SocialButton href={userData.social.linkedin}>
                {getIcon("linkedin", 24)}
                <p>{t("contatti.social.linkedin")}</p>
              </SocialButton>
              <SocialButton href={userData.social.github}>
                {getIcon("github", 24)}
                <p>{t("contatti.social.github")}</p>
              </SocialButton>
              <SocialButton href={`mailto:${userData.contacts.email.personal}`}>
                {getIcon("email", 24)}
                <p>{t("contatti.email.personal")}</p>
              </SocialButton>
            </div>
            <p className="mt-8 text-lg text-center md:text-left">
              {userData.bio}
            </p>
          </div>

          <div>
            <h1 className="text-4xl font-bold">{t("education")}</h1>
            {userData.education.studies.map((study, index) => (
              <div key={index} className="mt-4">
                <h2 className="text-2xl font-semibold">{study.istitution}</h2>
                <p className="text-lg">{study.description}</p>
              </div>
            ))}
          </div>

          <div>
            <h1 className="text-4xl font-bold">{t("skills.default")}</h1>
            <div className="mt-4">
              <SkillsTags skillType="all" className="mt-3" />
            </div>
          </div>          <div>
            <h1 className="text-4xl font-bold">{t("hobby.default")}</h1>
            <p className="mt-4 text-lg">{t("hobby.description")}</p>
            <div className="group flex flex-col gap-4 mt-4">
              {userData.hobbies.map((hobby, index) => {
                const isLast = index === userData.hobbies.length - 1;
                const hasLink = hobby.link;
                
                if (hasLink && hobby.link) {
                  return (
                    <Link key={index} href={hobby.link} className="relative flex flex-row items-start gap-4 hover:bg-gray-200 border border-transparent hover:dark:bg-black/20 hover:border-gray-400 hover:dark:border-gray-600 rounded-lg transition cursor-pointer">
                      {getIcon("arrow-up-right", 24, "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300")}
                      <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-center md:text-left">
                          {`${hobby.name}`}
                        </h1>
                        <p className="text-center md:text-left">
                          {`${hobby.description}`}
                        </p>
                      </div>
                    </Link>
                  );
                }
                
                return (
                  <div key={index} className="flex flex-col">
                    <h1 className="text-2xl font-bold text-center md:text-left">
                      {`${hobby.name}`}
                    </h1>
                    <p className="text-center md:text-left">
                      {`${hobby.description}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
