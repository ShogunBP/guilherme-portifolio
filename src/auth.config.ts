import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    authorized() {
      // O controle de rotas, cookies e redirects é gerenciado no src/middleware.ts
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig
