import { notFound } from 'next/navigation'

/** Unknown URLs under a locale render the locale-aware not-found page. */
export default function CatchAll() {
  notFound()
}
