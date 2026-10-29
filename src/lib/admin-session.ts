import type { Session } from 'next-auth'
import { auth } from '@/auth'

/**
 * Guard server-side para rotas e páginas administrativas no runtime Node.
 *
 * O callback `session` em `src/auth.ts` já sanitiza a sessão: token sem
 * `credentialVersion` numérico, versão desatualizada ou falha de leitura da
 * credencial vigente resultam em `session.user` ausente (fail-closed).
 * Aqui basta exigir a identidade exposta; nenhum segredo é lido.
 */
export async function requireCurrentAdminSession(): Promise<Session | null> {
  const session = await auth()
  const user = session?.user

  if (!session || !user || typeof user.email !== 'string' || !user.email) {
    return null
  }

  return session
}
