import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import type { GitHubProfile } from 'next-auth/providers/github'
import type { Provider } from 'next-auth/providers'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

const providers: Provider[] = [
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      const email = String(credentials.email).trim().toLowerCase()
      const password = String(credentials.password)

      const adminEmail = (process.env.ADMIN_EMAIL || '')
        .replace(/^["']|["']$/g, '')
        .trim()
        .toLowerCase()
      const adminPasswordHashRaw = (process.env.ADMIN_PASSWORD_HASH || '')
        .replace(/^["']|["']$/g, '')
        .trim()

      // Decodifica Base64 para recuperar o hash bcrypt ($2b$12$...)
      const adminPasswordHash = adminPasswordHashRaw
        ? Buffer.from(adminPasswordHashRaw, 'base64').toString('utf8')
        : ''

      if (!adminEmail || !adminPasswordHash) {
        console.error(
          '[Auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured in environment'
        )
        return null
      }

      if (email !== adminEmail) {
        return null
      }

      const isValid = bcrypt.compareSync(password, adminPasswordHash)
      if (!isValid) {
        return null
      }

      return {
        id: 'admin',
        email: adminEmail,
        name: 'Administrator',
      }
    },
  }),
]

// Ativa Google apenas se as credenciais existirem
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Ativa GitHub apenas se as credenciais existirem
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
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
    async signIn({ user, account, profile }) {
      // 1. Credenciais (email e senha) já validadas no authorize()
      if (account?.provider === 'credentials') {
        return true
      }

      const adminEmail = (process.env.ADMIN_EMAIL || '')
        .replace(/^["']|["']$/g, '')
        .trim()
        .toLowerCase()

      // 2. Validação Google
      if (account?.provider === 'google') {
        const allowedGoogleEmail = (
          process.env.ADMIN_GOOGLE_EMAIL || adminEmail
        )
          .replace(/^["']|["']$/g, '')
          .trim()
          .toLowerCase()
        const userEmail = (user.email || profile?.email || '')
          .trim()
          .toLowerCase()

        if (
          userEmail &&
          (userEmail === allowedGoogleEmail || userEmail === adminEmail)
        ) {
          return true
        }
        console.warn(
          `[Auth] Tentativa de login Google rejeitada para: ${userEmail}`
        )
        return false
      }

      // 3. Validação GitHub
      if (account?.provider === 'github') {
        const adminGithubUsername = (process.env.ADMIN_GITHUB_USERNAME || '')
          .replace(/^["']|["']$/g, '')
          .trim()
          .toLowerCase()
        const userEmail = (user.email || profile?.email || '')
          .trim()
          .toLowerCase()
        // Tipagem correta: GitHubProfile expõe login (username)
        const githubLogin = String(
          (profile as unknown as GitHubProfile)?.login || ''
        )
          .trim()
          .toLowerCase()

        const isEmailMatch = !!userEmail && userEmail === adminEmail
        const isUsernameMatch =
          !!adminGithubUsername && githubLogin === adminGithubUsername

        if (isEmailMatch || isUsernameMatch) {
          return true
        }

        console.warn(
          `[Auth] Tentativa de login GitHub rejeitada: login=${githubLogin}, email=${userEmail}`
        )
        return false
      }

      return false
    },
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
})
