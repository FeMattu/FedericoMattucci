import React from "react";
import fs from "fs";
import { useTranslations } from "next-intl";

interface SkillTagsProps {
  [category: string]: Record<string, string>;
}

export async function getSkillsFromFile(filePath: string) {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const skills: SkillTagsProps = JSON.parse(jsonData);
    return {
        props: {
            skills,
        },
    };
}

function CategoryTitle({category}:{category:string}) {
  const t = useTranslations();
  return (
    <h3 className="text-lg font-semibold capitalize">{t(category)}</h3>
  )
}

export default async function SkillsTag ({ JSONfile, className }:{ JSONfile:string, className?:string}) {

  const skills: SkillTagsProps = (await getSkillsFromFile(JSONfile)).props.skills;
  return (
    <div className={`space-y-2 overflow-y-auto ${className}`}>
      {Object.entries(skills).map(([category, technologies]: [string, Record<string, string>]) => (
        <div key={category}>
          <CategoryTitle category={category} />
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.values(technologies).map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-sm font-medium bg-gray-200 dark:bg-black/40 text-gray-700 dark:text-white rounded-lg"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
