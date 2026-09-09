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
