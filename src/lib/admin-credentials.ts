import db from '@/lib/db'

/**
 * Fonte efetiva da identidade administrativa.
 * - `database`: registro singleton completo na tabela `admin_credentials`.
 * - `environment`: bootstrap via `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` (somente quando não existe registro).
 */
export type AdminCredentialSource = 'database' | 'environment'

export interface EffectiveAdminCredential {
  source: AdminCredentialSource
  email: string
  passwordHash: string
  /** Versão vigente: 0 enquanto a fonte for o bootstrap do ambiente; >= 1 após o primeiro registro no banco. */
  credentialVersion: number
}

export interface AdminCredentialUpdateInput {
  /** Versão lida pela operação que está tentando gravar (controle otimista). */
  expectedVersion: number
  email?: string
  /** Hash bcrypt já calculado FORA da transação. */
  passwordHash?: string
}

export type AdminCredentialErrorCode =
  | 'db_error'
  | 'incomplete_record'
  | 'missing_bootstrap'
  | 'invalid_input'
  | 'version_conflict'

export class AdminCredentialError extends Error {
  readonly code: AdminCredentialErrorCode

  constructor(code: AdminCredentialErrorCode, message: string) {
    super(message)
    this.name = 'AdminCredentialError'
    this.code = code
  }
}

interface AdminCredentialRow {
  email: string
  password_hash: string
  credential_version: number
  created_at: string
  updated_at: string
}

const SELECT_CREDENTIAL_SQL = `
  SELECT email, password_hash, credential_version, created_at, updated_at
  FROM admin_credentials
  WHERE id = 1
`

const MAX_EMAIL_LENGTH = 254
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Bootstrap completo do ambiente, replicando o formato já aceito por `src/auth.ts`:
 * e-mail sem aspas/normalizado e hash bcrypt codificado em Base64.
 */
function readBootstrapFromEnvironment(): { email: string; passwordHash: string } {
  const email = normalizeEmail((process.env.ADMIN_EMAIL || '').replace(/^["']|["']$/g, ''))
  const rawHash = (process.env.ADMIN_PASSWORD_HASH || '').replace(/^["']|["']$/g, '').trim()
  const passwordHash = rawHash ? Buffer.from(rawHash, 'base64').toString('utf8').trim() : ''

  if (!email || !passwordHash) {
    throw new AdminCredentialError(
      'missing_bootstrap',
      'Bootstrap administrativo incompleto: ADMIN_EMAIL e ADMIN_PASSWORD_HASH são obrigatórios enquanto não existir credencial no banco.',
    )
  }

  return { email, passwordHash }
}

/** Leitura síncrona do registro. Qualquer falha de banco vira erro fail-closed, sem log de segredos. */
function readCredentialRow(): AdminCredentialRow | undefined {
  try {
    return db.prepare(SELECT_CREDENTIAL_SQL).get() as AdminCredentialRow | undefined
  } catch (error) {
    console.error(
      '[admin-credentials] Falha ao ler credenciais do banco; autenticação será negada.',
      error instanceof Error ? error.message : 'erro desconhecido',
    )
    throw new AdminCredentialError('db_error', 'Falha ao ler credenciais administrativas do banco de dados.')
  }
}

/**
 * Um registro existente precisa estar completo (e-mail, hash e versão válida).
 * Registro incompleto nunca é combinado com o ambiente: falha fechado.
 */
function assertCompleteRow(row: AdminCredentialRow): EffectiveAdminCredential {
  const email = typeof row.email === 'string' ? row.email.trim() : ''
  const passwordHash = typeof row.password_hash === 'string' ? row.password_hash.trim() : ''
  const version = row.credential_version

  if (!email || !passwordHash || !Number.isInteger(version) || version < 1) {
    console.error(
      '[admin-credentials] Registro administrativo incompleto; autenticação será negada sem fallback para o ambiente.',
    )
    throw new AdminCredentialError(
      'incomplete_record',
      'Registro de credenciais administrativas incompleto.',
    )
  }

  return {
    source: 'database',
    email: normalizeEmail(email),
    passwordHash,
    credentialVersion: version,
  }
}

/**
 * Fonte efetiva única: banco quando há registro completo, ambiente apenas no bootstrap.
 * Síncrona e fail-closed: erro de banco ou registro incompleto lançam `AdminCredentialError`.
 */
export function getEffectiveAdminCredential(): EffectiveAdminCredential {
  const row = readCredentialRow()

  if (row) {
    return assertCompleteRow(row)
  }

  const bootstrap = readBootstrapFromEnvironment()
  return {
    source: 'environment',
    email: bootstrap.email,
    passwordHash: bootstrap.passwordHash,
    credentialVersion: 0,
  }
}

/** Versão vigente da identidade administrativa (0 = ainda em bootstrap do ambiente). */
export function getAdminCredentialVersion(): number {
  return getEffectiveAdminCredential().credentialVersion
}

function validateEmailInput(email: string): string {
  const normalized = normalizeEmail(email)
  if (!normalized || normalized.length > MAX_EMAIL_LENGTH) {
    throw new AdminCredentialError('invalid_input', 'E-mail administrativo inválido.')
  }
  return normalized
}

function validateHashInput(passwordHash: string): string {
  const trimmed = passwordHash.trim()
  if (!BCRYPT_HASH_PATTERN.test(trimmed)) {
    throw new AdminCredentialError('invalid_input', 'Hash de senha inválido.')
  }
  return trimmed
}

/**
 * Atualiza a identidade administrativa em transação IMMEDIATE com controle otimista.
 * - Nenhum cálculo bcrypt acontece aqui: o hash chega pronto.
 * - `expectedVersion` diferente da versão vigente → `version_conflict` sem escrever.
 * - Qualquer falha dentro da transação provoca rollback total.
 */
export function updateAdminCredentials(input: AdminCredentialUpdateInput): { credentialVersion: number } {
  const { expectedVersion, email, passwordHash } = input

  if (!Number.isInteger(expectedVersion) || expectedVersion < 0) {
    throw new AdminCredentialError('invalid_input', 'Versão esperada inválida.')
  }
  if (email === undefined && passwordHash === undefined) {
    throw new AdminCredentialError('invalid_input', 'Nenhum campo de credencial informado.')
  }

  const nextEmailInput = email === undefined ? undefined : validateEmailInput(email)
  const nextHashInput = passwordHash === undefined ? undefined : validateHashInput(passwordHash)

  const runUpdate = db.transaction((): { credentialVersion: number } => {
    const row = readCredentialRow()
    const current = row ? assertCompleteRow(row) : undefined
    const currentVersion = current ? current.credentialVersion : 0

    if (currentVersion !== expectedVersion) {
      throw new AdminCredentialError(
        'version_conflict',
        'Credenciais alteradas por outra operação; recarregue e tente novamente.',
      )
    }

    // Base completa: registro existente ou bootstrap do ambiente, nunca mistura de fontes.
    // O bootstrap só é lido quando algum campo não foi informado.
    const bootstrap =
      !current && (!nextEmailInput || !nextHashInput) ? readBootstrapFromEnvironment() : undefined
    const finalEmail = nextEmailInput ?? current?.email ?? bootstrap!.email
    const finalHash = nextHashInput ?? current?.passwordHash ?? bootstrap!.passwordHash
    const nextVersion = currentVersion + 1

    try {
      db.prepare(`
        INSERT INTO admin_credentials (id, email, password_hash, credential_version, created_at, updated_at)
        VALUES (1, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          email = excluded.email,
          password_hash = excluded.password_hash,
          credential_version = excluded.credential_version,
          updated_at = datetime('now')
      `).run(finalEmail, finalHash, nextVersion)
    } catch (error) {
      console.error(
        '[admin-credentials] Falha ao gravar credenciais; transação revertida.',
        error instanceof Error ? error.message : 'erro desconhecido',
      )
      throw new AdminCredentialError('db_error', 'Falha ao gravar credenciais administrativas.')
    }

    return { credentialVersion: nextVersion }
  })

  return runUpdate.immediate()
}
