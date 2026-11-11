import type { ReactNode } from 'react'

/** A home-page section: anchor id for the top-bar scroll-spy, one heading, generous spacing. */
export function Section({
  id,
  title,
  action,
  children,
}: {
  id: string
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-5xl px-4 py-14 sm:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
