import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 dias (604800 segundos) sincronizado com cookie 2FA
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 dias (604800 segundos) sincronizado com cookie 2FA
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        if ('twoFactorEnabled' in user) {
          token.twoFactorEnabled = (user as { twoFactorEnabled?: boolean }).twoFactorEnabled
        }
      }
      if (trigger === 'update' && session && typeof session === 'object' && 'twoFactorEnabled' in session) {
        token.twoFactorEnabled = (session as { twoFactorEnabled?: boolean }).twoFactorEnabled
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string
        ;(session as unknown as { twoFactorEnabled?: boolean }).twoFactorEnabled = Boolean(
          token.twoFactorEnabled
        )
      }
      return session
    },
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig
