import NextAuth from "next-auth"
import "next-auth/jwt"
import Google from "next-auth/providers/google"

if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  secret: process.env.NEXTAUTH_SECRET,
  theme: { 
    colorScheme: "auto",
    logo: "https://authjs.dev/img/logo-sm.png" 
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt:{
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      const allowedEmails = ["mattucci.federico@gmail.com", "f.mattucci1@studenti.unipi.it", "federico.mattucci@jevis.it"];

      if (allowedEmails.includes(user.email!)) {
        return true;
      }

      return false;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.accessToken) session.accessToken = token.accessToken;
      return session;
    },
    async jwt({ token, account }: { token: any; account: any }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    }
  }
});

// Type declarations
declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}
