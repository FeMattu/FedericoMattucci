import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { Button } from '@/components/ui/button'
import { safeAdminPath } from '@/lib/auth/allowlist'
import { getAdminSession } from '@/lib/auth/session'

type Props = { searchParams: Promise<{ from?: string; error?: string }> }

export const metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: Props) {
  const { from, error } = await searchParams
  const target = safeAdminPath(from)
  if (await getAdminSession()) redirect(target)

  async function signInWithGitHub() {
    'use server'
    await signIn('github', { redirectTo: target })
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to edit the site.</p>

      {error && (
        <p role="alert" className="mt-6 rounded-md border border-destructive/40 p-3 text-sm text-destructive">
          {error === 'AccessDenied'
            ? 'This account is not allowed to sign in.'
            : 'Sign-in failed. Please try again.'}
        </p>
      )}

      <form action={signInWithGitHub} className="mt-8">
        <Button type="submit" className="w-full">
          Continue with GitHub
        </Button>
      </form>
    </main>
  )
}
