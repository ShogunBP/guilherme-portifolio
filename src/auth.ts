import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import type { GitHubProfile } from 'next-auth/providers/github'
import type { Provider } from 'next-auth/providers'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import { isTwoFactorEnabled } from './lib/totp'
import {
  AdminCredentialError,
  getAdminCredentialVersion,
  getEffectiveAdminCredential,
} from './lib/admin-credentials'

// Ligação da versão de credencial com a fonte efetiva; qualquer falha (banco
// indisponível, registro incompleto) retorna `null` e marca a sessão inválida.
function getCurrentCredentialVersionSafe(): number | null {
  try {
    return getAdminCredentialVersion()
  } catch (error) {
    console.error(
      '[Auth] Verificação de versão de credencial falhou; sessão será tratada como inválida.',
      error instanceof AdminCredentialError ? error.code : 'erro desconhecido',
    )
    return null
  }
}

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

      // Fonte efetiva única (banco → bootstrap do ambiente). Erro de banco ou
      // registro incompleto nega o login: falha fechado, sem fallback silencioso.
      let credential
      try {
        credential = getEffectiveAdminCredential()
      } catch (error) {
        console.error(
          '[Auth] Autenticação negada pela camada de credenciais.',
          error instanceof AdminCredentialError ? error.code : 'erro desconhecido',
        )
        return null
      }

      // Mitigação de enumeração temporal: a comparação custosa (bcrypt) é sempre
      // executada, mesmo com e-mail inválido, para uniformizar o tempo de resposta.
      let isValid = false
      try {
        isValid = await bcrypt.compare(password, credential.passwordHash)
      } catch {
        // Hash malformado ou bcrypt indisponível: negar sem informação adicional.
        isValid = false
      }

      if (email !== credential.email || !isValid) {
        return null
      }

      const is2FA = isTwoFactorEnabled()
      return {
        id: 'admin',
        email: credential.email,
        name: 'Administrator',
        twoFactorEnabled: is2FA,
        credentialVersion: credential.credentialVersion,
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
    jwt({ token, user, trigger, session }) {
      // Ligação com a credencial vigente (fonte efetiva única).
      const currentVersion = getCurrentCredentialVersionSafe()

      // 1. Login (credenciais ou OAuth): emissão de claims frescos.
      if (user) {
        token.id = user.id
        token.email = user.email

        if ('twoFactorEnabled' in user) {
          token.twoFactorEnabled = (user as { twoFactorEnabled?: boolean })
            .twoFactorEnabled
        }

        if (typeof user.credentialVersion === 'number') {
          token.credentialVersion = user.credentialVersion
        } else if (currentVersion === null) {
          // Falha fechado no emissor: não é possível validar a versão vigente.
          return { credentialInvalid: true }
        } else {
          // OAuth recebe a versão atual no login (mesmo acesso administrativo).
          token.credentialVersion = currentVersion
        }

        return token
      }

      // 2. Apresentações subsequentes: token legado sem claim, versão
      //    desatualizada (credenciais trocadas) ou estado inválido → fail-closed.
      if (
        token.credentialInvalid === true ||
        currentVersion === null ||
        typeof token.credentialVersion !== 'number' ||
        token.credentialVersion !== currentVersion
      ) {
        // Nenhum dado de identidade é preservado para os guardas.
        return { credentialInvalid: true }
      }

      // 3. Atualização de sessão (ex.: toggle de 2FA) apenas com token válido.
      // Sempre sincroniza o status mais recente do SQLite no token JWT.
      token.twoFactorEnabled = isTwoFactorEnabled()
      if (trigger === 'update' && session && typeof session === 'object' && 'twoFactorEnabled' in session) {
        token.twoFactorEnabled = (session as { twoFactorEnabled?: boolean }).twoFactorEnabled
      }
      return token
    },
    session({ session, token }) {
      const isTokenInvalid =
        !token ||
        token.credentialInvalid === true ||
        typeof token.credentialVersion !== 'number' ||
        typeof token.email !== 'string' ||
        !token.email

      if (isTokenInvalid) {
        // Sessão sem identidade: guardas falham fechado e nada sensível é exposto.
        delete (session as { user?: unknown }).user
        session.twoFactorEnabled = false
        return session
      }

      if (session.user) {
        session.user.id = typeof token.id === 'string' ? token.id : 'admin'
        session.user.email = token.email as string
      }
      session.twoFactorEnabled = Boolean(token.twoFactorEnabled)
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
          ;(user as { twoFactorEnabled?: boolean }).twoFactorEnabled = isTwoFactorEnabled()
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
          ;(user as { twoFactorEnabled?: boolean }).twoFactorEnabled = isTwoFactorEnabled()
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
    maxAge: 7 * 24 * 60 * 60, // 7 dias (604800 segundos) sincronizado com cookie 2FA
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 dias (604800 segundos) sincronizado com cookie 2FA
  },
  trustHost: true,
})
