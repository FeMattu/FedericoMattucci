import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { isAdminEmail } from '@/lib/auth/allowlist'
import { prisma } from '@/lib/db/prisma'

/**
 * Auth.js v5. GitHub OAuth (AUTH_GITHUB_ID / AUTH_GITHUB_SECRET), database
 * sessions through the Prisma adapter. Only ADMIN_EMAIL may sign in: the
 * `signIn` callback runs before Auth.js creates a user row, so a stranger
 * leaves no trace in the database.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    signIn({ user }) {
      return isAdminEmail(user.email, process.env.ADMIN_EMAIL)
    },
  },
})
