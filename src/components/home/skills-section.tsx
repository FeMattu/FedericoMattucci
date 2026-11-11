'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { SkillCategoryView } from '@/lib/content/view'

type Skill = SkillCategoryView['skills'][number]

/** Five dots, `level` of them filled. Decorative: the level is also in the accessible name. */
function LevelDots({ level }: { level: number }) {
  return (
    <span className="ml-2 inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < level ? 'size-1.5 rounded-full bg-primary' : 'size-1.5 rounded-full bg-border'} />
      ))}
    </span>
  )
}

function SkillBadge({ skill }: { skill: Skill }) {
  const t = useTranslations('skills')
  const details = [
    skill.level ? t('level', { level: skill.level }) : null,
    skill.years ? t('years', { years: skill.years }) : null,
    skill.description || null,
  ].filter(Boolean) as string[]

  const badge = (
    <Badge
      variant="secondary"
      className="px-3 py-1 text-sm font-normal"
      tabIndex={details.length > 0 ? 0 : undefined}
      aria-label={details.length > 0 ? `${skill.name}. ${details.join('. ')}` : undefined}
    >
      {skill.name}
      {skill.level ? <LevelDots level={skill.level} /> : null}
    </Badge>
  )

  if (details.length === 0) return badge
  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <ul className="space-y-0.5">
          {details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}

export function SkillsSection({ categories }: { categories: SkillCategoryView[] }) {
  const first = categories[0]
  if (!first) return null

  return (
    <Tabs defaultValue={first.slug}>
      <TabsList className="h-auto flex-wrap justify-start">
        {categories.map((c) => (
          <TabsTrigger key={c.slug} value={c.slug}>
            {c.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((c) => (
        // forceMount keeps every category in the HTML (SEO, no-JS); inactive ones are hidden.
        <TabsContent key={c.slug} value={c.slug} forceMount className="mt-6 data-[state=inactive]:hidden">
          <ul className="flex flex-wrap gap-2">
            {c.skills.map((s) => (
              <li key={s.id}>
                <SkillBadge skill={s} />
              </li>
            ))}
          </ul>
        </TabsContent>
      ))}
    </Tabs>
  )
}
