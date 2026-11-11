import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ContactForm } from '@/components/home/contact-form'
import { ContactSection } from '@/components/home/contact-section'
import { Hero } from '@/components/home/hero'
import { ProjectsSection } from '@/components/home/projects-section'
import { Section } from '@/components/home/section'
import { SkillsSection } from '@/components/home/skills-section'
import { TimelineCard } from '@/components/home/timeline-card'
import { Badge } from '@/components/ui/badge'
import { PhotosPreview } from '@/components/home/photos-preview'
import { getHomeContent } from '@/lib/content'
import { getPhotosContent } from '@/lib/content/photos'
import { cdnUrls } from '@/lib/storage/cdn'
import { isProfileKey } from '@/lib/uploads/validate'

type Props = { params: Promise<{ locale: string }> }

/** Static page, refreshed every 5 minutes and on every admin save (signed image URLs stay valid for 8 days). */
export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const { texts } = await getHomeContent(locale)
  const description = texts['seo.home.description']
  return description ? { description, openGraph: { description } } : {}
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, content, { photos }] = await Promise.all([
    getTranslations('sections'),
    getHomeContent(locale),
    getPhotosContent(locale),
  ])
  const { texts } = content
  const avatarKey = isProfileKey(texts['hero.avatar']) ? texts['hero.avatar'] : undefined
  const coverUrls = cdnUrls([...content.projects.map((p) => p.coverKey), avatarKey])

  return (
    <>
      <Hero
        role={texts['hero.role'] ?? ''}
        location={texts['hero.location'] ?? ''}
        bio={texts['about.bio'] ?? ''}
        cvUrl={texts['cv.url'] ?? ''}
        hasProjects={content.projects.length > 0}
        avatarUrl={avatarKey ? coverUrls[avatarKey] : undefined}
      />

      {content.experiences.length > 0 && (
        <Section id="experience" title={t('experience')}>
          <ul className="grid gap-4">
            {content.experiences.map((e) => (
              <li key={e.id}>
                <TimelineCard
                  href={`/experience/${e.slug}`}
                  period={e.period}
                  title={e.role}
                  subtitle={e.organization}
                  summary={e.summary}
                  tags={e.tags}
                  current={e.isCurrent}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {content.education.length > 0 && (
        <Section id="education" title={t('education')}>
          <ul className="grid gap-4">
            {content.education.map((e) => (
              <li key={e.id}>
                <TimelineCard
                  href={`/education/${e.slug}`}
                  period={e.period}
                  title={e.title}
                  subtitle={e.institution}
                  summary={e.summary}
                />
              </li>
            ))}
          </ul>
          {content.certifications.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('certifications')}</h3>
              <ul className="flex flex-wrap gap-2">
                {content.certifications.map((c) => (
                  <li key={c.id}>
                    <Badge variant="outline" className="px-3 py-1 font-normal">
                      {c.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {content.skillCategories.length > 0 && (
        <Section id="skills" title={t('skills')}>
          <SkillsSection categories={content.skillCategories} />
        </Section>
      )}

      {content.projects.length > 0 && (
        <Section id="projects" title={t('projects')}>
          <ProjectsSection projects={content.projects} tags={content.projectTags} coverUrls={coverUrls} />
        </Section>
      )}

      {photos.length > 0 && (
        <Section id="photos" title={t('photos')}>
          <PhotosPreview photos={photos} />
        </Section>
      )}

      <Section id="contact" title={t('contact')}>
        <ContactSection socials={content.socials}>
          <ContactForm />
        </ContactSection>
      </Section>
    </>
  )
}
