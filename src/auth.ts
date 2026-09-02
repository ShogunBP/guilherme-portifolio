import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
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
          console.error('[Auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured in environment')
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
  ],
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
})
