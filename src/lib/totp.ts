import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'
import { db } from './db'

export interface TwoFactorAuthRecord {
  id: string
  secret: string
  enabled: number
  created_at: string
  updated_at: string
}

const ISSUER = 'Guilherme Portfólio'
const LABEL = 'admin'

/**
 * Retorna o registro atual de 2FA do banco SQLite.
 */
export function getTwoFactorRecord(): TwoFactorAuthRecord | undefined {
  return db
    .prepare('SELECT id, secret, enabled, created_at, updated_at FROM two_factor_auth WHERE id = ?')
    .get('default') as TwoFactorAuthRecord | undefined
}

/**
 * Retorna se o 2FA está ativado.
 */
export function isTwoFactorEnabled(): boolean {
  const record = getTwoFactorRecord()
  return Boolean(record && record.enabled === 1)
}

/**
 * Gera um novo segredo Base32 aleatório e seguro utilizando otpauth.
 */
export function generateTotpSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 })
  return secret.base32
}

/**
 * Retorna a instância OTPAuth.TOTP configurada.
 */
export function getTotpInstance(secretBase32: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: LABEL,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
}

/**
 * Gera a URI otpauth:// padronizada para escaneamento em apps autenticadores.
 */
export function generateTotpUri(secretBase32: string, label = LABEL): string {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
  return totp.toString()
}

/**
 * Gera uma imagem QR Code em formato Data URL a partir da URI otpauth://.
 */
export async function generateTotpQrCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

/**
 * Valida um código de 6 dígitos com janela de tolerância de 1 período (30s antes / 30s depois).
 */
export function verifyTotpCode(secretBase32: string, token: string): boolean {
  const cleanToken = token.replace(/\s+/g, '').trim()
  if (!/^\d{6}$/.test(cleanToken)) {
    return false
  }

  const totp = getTotpInstance(secretBase32)
  const delta = totp.validate({
    token: cleanToken,
    window: 1,
  })

  return delta !== null
}

/**
 * Salva ou substitui o segredo com enabled = 0, aguardando a confirmação do primeiro código.
 */
export function savePendingTotpSecret(secretBase32: string): void {
  db.prepare(`
    INSERT INTO two_factor_auth (id, secret, enabled, updated_at)
    VALUES ('default', ?, 0, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      secret = excluded.secret,
      enabled = 0,
      updated_at = datetime('now')
  `).run(secretBase32)
}

/**
 * Ativa o 2FA após a confirmação válida do primeiro código.
 */
export function enableTwoFactorAuth(): void {
  db.prepare(`
    UPDATE two_factor_auth
    SET enabled = 1, updated_at = datetime('now')
    WHERE id = 'default'
  `).run()
}

/**
 * Desativa o 2FA no banco de dados (toggle simples).
 */
export function disableTwoFactorAuth(): void {
  db.prepare(`
    UPDATE two_factor_auth
    SET enabled = 0, updated_at = datetime('now')
    WHERE id = 'default'
  `).run()
}

/**
 * Interface do registro de código de backup no SQLite.
 */
export interface BackupCodeRecord {
  id: number
  user_id: string
  code_hash: string
  used: number
  used_at: string | null
  created_at: string
}

const BACKUP_CODE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Base32 amigável (sem 0, 1, O, I para legibilidade)

/**
 * Gera um código alfanumérico aleatório seguro no formato XXXX-XXXX (ex: A3F9-8K2P).
 */
export function generateSingleBackupCode(): string {
  const bytes = crypto.randomBytes(8)
  let part1 = ''
  let part2 = ''

  for (let i = 0; i < 4; i++) {
    part1 += BACKUP_CODE_CHARSET[bytes[i] % BACKUP_CODE_CHARSET.length]
    part2 += BACKUP_CODE_CHARSET[bytes[i + 4] % BACKUP_CODE_CHARSET.length]
  }

  return `${part1}-${part2}`
}

/**
 * Normaliza um código de backup (remove espaços, hífen e converte para maiúsculo).
 */
export function normalizeBackupCode(code: string): string {
  return code.replace(/[\s-]/g, '').toUpperCase()
}

/**
 * Formata um código de 8 caracteres no formato XXXX-XXXX.
 */
export function formatBackupCode(code: string): string {
  const clean = normalizeBackupCode(code)
  if (clean.length !== 8) return clean
  return `${clean.slice(0, 4)}-${clean.slice(4)}`
}

/**
 * Gera 10 códigos de backup descartáveis, hasheia com bcryptjs e salva no SQLite.
 * Remove quaisquer códigos de backup antigos pertencentes ao usuário 'default'.
 * Retorna os 10 códigos em texto claro formatados como XXXX-XXXX para exibição única.
 */
export async function generateAndSaveBackupCodes(userId = 'default'): Promise<string[]> {
  const plainCodes: string[] = []
  const hashedRecords: { hash: string }[] = []

  for (let i = 0; i < 10; i++) {
    const code = generateSingleBackupCode()
    plainCodes.push(code)
    // Hash do código normalizado (8 caracteres sem hífen)
    const normalized = normalizeBackupCode(code)
    const hash = await bcrypt.hash(normalized, 10)
    hashedRecords.push({ hash })
  }

  // Transação no SQLite para invalidar anteriores e inserir novos
  const insertTransaction = db.transaction(() => {
    db.prepare('DELETE FROM two_factor_backup_codes WHERE user_id = ?').run(userId)

    const insertStmt = db.prepare(`
      INSERT INTO two_factor_backup_codes (user_id, code_hash, used, created_at)
      VALUES (?, ?, 0, datetime('now'))
    `)

    for (const record of hashedRecords) {
      insertStmt.run(userId, record.hash)
    }
  })

  insertTransaction()

  return plainCodes
}

/**
 * Retorna a quantidade de códigos de backup não utilizados disponíveis.
 */
export function getAvailableBackupCodesCount(userId = 'default'): number {
  const result = db
    .prepare('SELECT COUNT(*) as count FROM two_factor_backup_codes WHERE user_id = ? AND used = 0')
    .get(userId) as { count: number } | undefined
  return result?.count ?? 0
}

export type VerifyBackupCodeResult =
  | { success: true; message: string }
  | { success: false; reason: 'not_found' | 'already_used' | 'invalid_format' }

/**
 * Valida um código de backup digitado pelo usuário.
 * Se corresponder a um código não utilizado, marca como used = 1 e used_at = datetime('now').
 * Se corresponder a um código já utilizado, retorna razão explícita 'already_used'.
 */
export async function verifyAndConsumeBackupCode(
  inputCode: string,
  userId = 'default'
): Promise<VerifyBackupCodeResult> {
  const normalized = normalizeBackupCode(inputCode)
  if (normalized.length !== 8) {
    return { success: false, reason: 'invalid_format' }
  }

  // Busca todos os códigos do usuário (para poder distinguir se foi usado ou nunca existiu)
  const records = db
    .prepare('SELECT id, code_hash, used FROM two_factor_backup_codes WHERE user_id = ?')
    .all(userId) as BackupCodeRecord[]

  if (!records || records.length === 0) {
    return { success: false, reason: 'not_found' }
  }

  // 1. Verifica primeiro contra os códigos AINDA NÃO USADOS
  for (const record of records) {
    if (record.used === 0) {
      const matches = await bcrypt.compare(normalized, record.code_hash)
      if (matches) {
        // Marca como usado imediatamente
        db.prepare(`
          UPDATE two_factor_backup_codes
          SET used = 1, used_at = datetime('now')
          WHERE id = ?
        `).run(record.id)

        return { success: true, message: 'Código de backup válido e consumido.' }
      }
    }
  }

  // 2. Se não bateu com nenhum não-usado, verifica se pertence a algum que JÁ FOI USADO
  for (const record of records) {
    if (record.used === 1) {
      const matches = await bcrypt.compare(normalized, record.code_hash)
      if (matches) {
        return { success: false, reason: 'already_used' }
      }
    }
  }

  return { success: false, reason: 'not_found' }
}
