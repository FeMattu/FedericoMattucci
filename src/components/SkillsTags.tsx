"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useUserData } from "@/hooks/useUserData";
import { useParams } from "next/navigation";
import Skill from "@/lib/interfaces/Skill";

function SkillTag({ skill }: { skill: Skill }) {
  return (
    <span className="px-3 py-1 text-sm font-medium bg-gray-200 dark:bg-black/40 text-gray-700 dark:text-white rounded-lg">
      {skill.name}
    </span>
  );
}

function SkillGroup({ skills, title, level = 0 }: { skills: Skill[], title?: string, level?: number }) {
  const marginClass = level > 0 ? 'ml-4' : '';
  
  return (
    <div className={`mb-3 ${marginClass}`}>
      {title && (
        <h4 className={`text-md font-medium text-[var(--text-primary)] mb-2 ${level > 0 ? 'text-sm' : ''}`}>
          {title}
        </h4>
      )}
      <div className="flex items-center justify-center md:justify-start flex-wrap gap-2">
        {skills.map((skill, index) => {
          if (skill.list && skill.list.length > 0) {
            // Questo è un superskill/categoria, renderizza ricorsivamente
            return (
              <div key={index} className="w-full">
                <SkillGroup skills={skill.list} title={skill.name} level={level + 1} />
              </div>
            );
          } else {
            // Questa è una skill foglia
            return <SkillTag key={index} skill={skill} />;
          }
        })}
      </div>
    </div>
  );
}

export default function SkillsTags({ className, skillType = "all" }: { className?: string; skillType?: string }) {
  const t = useTranslation();
  const params = useParams();
  const locale = params.locale as string || "it";
  const { data: userData, loading } = useUserData(locale);

  if (loading || !userData) {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-[var(--text-secondary)]">{t('loading.userInfo')}</p>
      </div>
    );
  }

  // Filter skills based on skillType - now working with the recursive structure
  const getFilteredSkills = (skills: Skill[]): Skill[] => {
    if (skillType === 'all') {
      return skills;
    }
    return skills;
  };

  const filteredSkills = getFilteredSkills(userData.skills);

  return (
    <div className={`space-y-6 overflow-y-auto ${className}`}>
      <SkillGroup skills={filteredSkills} />
    </div>
  );
}
