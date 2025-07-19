"use client";

import { useTranslation } from "@/lib/translation";
import { useUserData } from "@/lib/utils";

interface Skill {
  name: string;
  level?: string;
  list?: Skill[];
}

interface SkillCategory {
  name: string;
  "front-end"?: {
    title: string;
    list: Skill[];
  };
  "back-end"?: {
    title: string;
    list: Skill[];
  };
  mobile?: {
    title: string;
    list: Skill[];
  };
  list?: Skill[];
}

function SkillTag({ skill }: { skill: Skill }) {
  return (
    <span className="px-3 py-1 text-sm font-medium bg-gray-200 dark:bg-black/40 text-gray-700 dark:text-white rounded-lg">
      {skill.name} {skill.level && `(${skill.level})`}
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
            // Questo è un gruppo di skill, renderizza ricorsivamente
            return (
              <div key={index} className="w-full">
                <SkillGroup skills={skill.list} title={skill.name} level={level + 1} />
              </div>
            );
          } else {
            // Questo è una skill singola
            return <SkillTag key={index} skill={skill} />;
          }
        })}
      </div>
    </div>
  );
}

function CategoryTitle({ category }: { category: string }) {
  const t = useTranslation();
  return <h3 className="text-lg font-semibold capitalize mb-2">{category}</h3>;
}

export default function SkillsTags({ className, skillType }: { className?: string; skillType?: 'programming' | 'computer' | 'all' }) {
  const userData = useUserData();
  const t = useTranslation();

  if (!userData) {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-[var(--text-secondary)]">{t('loading.user-info')}</p>
      </div>
    );
  }

  // Filter skills based on skillType
  const getFilteredSkills = (): SkillCategory[] => {
    if (skillType === 'programming') {
      return userData.skills.filter(skill => 
        skill.name.includes('programming') || 
        skill.name.includes('language') ||
        skill["front-end"] || 
        skill["back-end"] || 
        skill.mobile
      );
    } else if (skillType === 'computer') {
      return userData.skills.filter(skill => 
        !skill.name.includes('programming') && 
        !skill.name.includes('language') &&
        !skill["front-end"] && 
        !skill["back-end"] && 
        !skill.mobile
      );
    } else {
      return userData.skills;
    }
  };

  const filteredSkills = getFilteredSkills();

  return (
    <div className={`space-y-6 overflow-y-auto ${className}`}>
      {filteredSkills.map((skillCategory, categoryIndex) => (
        <div key={categoryIndex} className="space-y-3">
          <CategoryTitle category={skillCategory.name} />
          
          {/* Front-end skills */}
          {skillCategory["front-end"] && (
            <SkillGroup 
              skills={skillCategory["front-end"].list} 
              title={skillCategory["front-end"].title} 
            />
          )}
          
          {/* Back-end skills */}
          {skillCategory["back-end"] && (
            <SkillGroup 
              skills={skillCategory["back-end"].list} 
              title={skillCategory["back-end"].title} 
            />
          )}
          
          {/* Mobile skills */}
          {skillCategory.mobile && (
            <SkillGroup 
              skills={skillCategory.mobile.list} 
              title={skillCategory.mobile.title} 
            />
          )}
          
          {/* Other skills (direct list) */}
          {skillCategory.list && (
            <SkillGroup skills={skillCategory.list} />
          )}
        </div>
      ))}
    </div>
  );
}
