import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isLoginPage = nextUrl.pathname === '/admin/login'

      if (isOnAdmin) {
        if (isLoginPage) {
          if (isLoggedIn) {
            return Response.redirect(new URL('/admin', nextUrl))
          }
          return true
        }
        if (isLoggedIn) {
          return true
        }
        return false // Redirects to /admin/login
      }
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
