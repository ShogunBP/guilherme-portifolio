/**
 * Utilitários para criação e verificação de cookies assinados para 2FA.
 * Compatível com Edge Runtime (middleware) e Node.js utilizando Web Crypto API (crypto.subtle).
 */

export const COOKIE_2FA_VERIFIED = 'admin_2fa_verified'
export const COOKIE_2FA_STATUS = 'admin_2fa_status'

// Duração estrita de 7 dias sincronizada com a sessão NextAuth
export const MAX_AGE_7_DAYS = 7 * 24 * 60 * 60 // 604800 segundos

export const COOKIE_OPTIONS_VERIFIED = {
  name: COOKIE_2FA_VERIFIED,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE_7_DAYS,
}

export const COOKIE_OPTIONS_STATUS = {
  name: COOKIE_2FA_STATUS,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE_7_DAYS,
}

function getSecretKey(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[totp-token] AUTH_SECRET is not defined in production environment')
    }
    return 'fallback-dev-secret-totp-not-for-production-use-12345'
  }
  return secret
}

async function getCryptoKey(): Promise<CryptoKey> {
  const secret = getSecretKey()
  const encoder = new TextEncoder()
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function toBase64Url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64url')
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(b64url: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64url, 'base64url').toString('utf8')
  }
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(b64)))
}

function uint8ArrayToHex(arr: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(arr).toString('hex')
  }
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToUint8Array(hex: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(hex, 'hex')
  }
  const match = hex.match(/.{1,2}/g) || []
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)))
}

/**
 * Cria o token assinado admin_2fa_verified com expiração em 7 dias.
 */
export async function create2FaVerifiedToken(): Promise<string> {
  const key = await getCryptoKey()
  const payload = JSON.stringify({
    verified: true,
    exp: Date.now() + MAX_AGE_7_DAYS * 1000,
  })
  const encodedPayload = toBase64Url(payload)
  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload))
  const sigHex = uint8ArrayToHex(new Uint8Array(signature))
  return `${encodedPayload}.${sigHex}`
}

/**
 * Verifica se o token admin_2fa_verified é autêntico e se ainda não expirou.
 */
export async function verify2FaVerifiedToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [encodedPayload, sigHex] = parts
  try {
    const key = await getCryptoKey()
    const encoder = new TextEncoder()
    const sigBytes = hexToUint8Array(sigHex)

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      encoder.encode(encodedPayload)
    )

    if (!isValid) return false

    const rawPayload = fromBase64Url(encodedPayload)
    const data = JSON.parse(rawPayload) as { verified?: boolean; exp?: number }

    if (!data.verified || !data.exp) return false
    return Date.now() < data.exp
  } catch {
    return false
  }
}

/**
 * Cria o token de status de 2FA (enabled: boolean) assinado por AUTH_SECRET.
 */
export async function create2FaStatusToken(enabled: boolean): Promise<string> {
  const key = await getCryptoKey()
  const payload = JSON.stringify({
    enabled: Boolean(enabled),
    ts: Date.now(),
  })
  const encodedPayload = toBase64Url(payload)
  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload))
  const sigHex = uint8ArrayToHex(new Uint8Array(signature))
  return `${encodedPayload}.${sigHex}`
}

/**
 * Verifica e extrai o status de 2FA a partir do token assinado.
 * Retorna { enabled: boolean } ou null se for inválido ou adulterado.
 */
export async function verify2FaStatusToken(
  token: string | undefined | null
): Promise<{ enabled: boolean } | null> {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [encodedPayload, sigHex] = parts
  try {
    const key = await getCryptoKey()
    const encoder = new TextEncoder()
    const sigBytes = hexToUint8Array(sigHex)

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      encoder.encode(encodedPayload)
    )

    if (!isValid) return null

    const rawPayload = fromBase64Url(encodedPayload)
    const data = JSON.parse(rawPayload) as { enabled?: boolean }

    if (typeof data.enabled !== 'boolean') return null
    return { enabled: data.enabled }
  } catch {
    return null
  }
}
