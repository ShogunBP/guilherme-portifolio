import type { DefaultSession } from 'next-auth'

/**
 * Module augmentation do Auth.js v5 para a fatia de integração do
 * gerenciamento de credenciais do admin (card admin-troca-credenciais).
 *
 * - `User.credentialVersion`: versão vigente da identidade no login.
 * - `JWT.credentialVersion`: claim persistido na emissão e comparado em cada
 *   apresentação (JWT legado sem o claim é tratado como inválido).
 * - `JWT.credentialInvalid`: marcador de fail-closed (sessão rejeitada).
 * - `Session.user` continua opcional para permitir sessão sem identidade
 *   exposta quando o token for inválido.
 * - Nenhuma informação sensível (hash, segredos, tokens) entra no Session.
 */
declare module 'next-auth' {
  interface User {
    /** Versão da credencial vigente no momento do login por credenciais. */
    credentialVersion?: number
  }

  interface Session {
    /**
     * Presente somente quando token e versão forem válidos.
     * Sessões inválidas expõem `user` ausente (fail-closed).
     * `| undefined` explícito habilita a sanitização tipada no callback.
     */
    user?: ((DefaultSession['user'] & { id: string; email: string }) | undefined)
    /** Estado do 2FA lido do token; falso em sessão inválida. */
    twoFactorEnabled?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** Identificador interno do administrador. */
    id?: string
    /** Versão da credencial capturada no login; usada para invalidar sessões antigas. */
    credentialVersion?: number
    /** Marcador de fail-closed: token sem claim legível ou desatualizado. */
    credentialInvalid?: boolean
    /** Estado do 2FA sincronizado com o SQLite. */
    twoFactorEnabled?: boolean
  }
}
