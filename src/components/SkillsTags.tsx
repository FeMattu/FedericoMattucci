"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface SkillTagsProps {
  [category: string]: Record<string, string>;
}

function CategoryTitle({ category }: { category: string }) {
  const t = useTranslations();
  return <h3 className="text-lg font-semibold capitalize">{t(category)}</h3>;
}

export default function SkillsTag({ JSONfile, className }: { JSONfile: string; className?: string }) {
  const [skills, setSkills] = useState<SkillTagsProps>({});
  
  useEffect(() => {
    fetch(JSONfile)
      .then((res) => res.json())
      .then((data) => setSkills(data))
      .catch((error) => console.error("Errore nel caricamento delle competenze:", error));
  }, [JSONfile]);

  return (
    <div className={`space-y-2 overflow-y-auto ${className}`}>
      {Object.entries(skills).map(([category, technologies]) => (
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
}
