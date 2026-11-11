import { setRequestLocale } from 'next-intl/server'

type Props = { params: Promise<{ locale: string }> }

// Placeholder: replaced by the real home sections in the "public site" phase.
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Federico Mattucci</h1>
    </div>
  )
}
