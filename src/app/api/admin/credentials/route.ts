import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import {
  AdminCredentialError,
  getEffectiveAdminCredential,
  updateAdminCredentials,
} from '@/lib/admin-credentials'
import { requireCurrentAdminSession } from '@/lib/admin-session'

interface CredentialChangeBody {
  currentPassword?: unknown
  email?: unknown
  newPassword?: unknown
  confirmPassword?: unknown
  expectedVersion?: unknown
}

const attempts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 15 * 60 * 1000
const RATE_MAP_MAX_ENTRIES = 5000
const MAX_BODY_BYTES = 8 * 1024
const MAX_PASSWORD_LENGTH = 256
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isSameSiteRequest(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) return false

  const fetchSite = request.headers.get('sec-fetch-site')
  return !fetchSite || ['same-origin', 'same-site', 'none'].includes(fetchSite)
}

/**
 * O painel possui uma única identidade administrativa. Uma chave global evita
 * confiar em cabeçalhos de IP que podem ser forjados fora de um proxy confiável.
 */
function getRateLimitKey(): string {
  return 'admin-credential-change'
}

/** Remove entradas expiradas e limita o crescimento do mapa em memória. */
function pruneRateLimit(now: number): void {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key)
  }
  if (attempts.size > RATE_MAP_MAX_ENTRIES) {
    const oldest = attempts.keys().next()
    if (!oldest.done) attempts.delete(oldest.value)
  }
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  pruneRateLimit(now)
  const entry = attempts.get(key)

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT
}

function clearRateLimit(key: string): void {
  attempts.delete(key)
}

function invalidRequest(message = 'Não foi possível alterar as credenciais.'): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}

/** Lê o corpo com limite real de bytes (não confia apenas no Content-Length). */
async function readJsonBody(
  request: Request,
): Promise<{ ok: true; body: CredentialChangeBody } | { ok: false; status: 400 | 413 }> {
  const rawBody = await request.text().catch(() => null)
  if (rawBody === null) return { ok: false, status: 400 }
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) return { ok: false, status: 413 }

  try {
    const parsed = JSON.parse(rawBody) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, status: 400 }
    }
    return { ok: true, body: parsed as CredentialChangeBody }
  } catch {
    return { ok: false, status: 400 }
  }
}

export async function GET() {
  const session = await requireCurrentAdminSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const credential = getEffectiveAdminCredential()
    return NextResponse.json({
      email: credential.email,
      credentialVersion: credential.credentialVersion,
    })
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível carregar as credenciais.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || '0')
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Requisição muito grande.' }, { status: 413 })
  }

  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: 'Requisição não permitida.' }, { status: 403 })
  }

  const session = await requireCurrentAdminSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) {
    return parsedBody.status === 413
      ? NextResponse.json({ error: 'Requisição muito grande.' }, { status: 413 })
      : invalidRequest()
  }
  const body = parsedBody.body

  const currentPassword =
    typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const requestedEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : undefined
  const confirmPassword =
    typeof body.confirmPassword === 'string' ? body.confirmPassword : undefined
  const expectedVersion = body.expectedVersion

  if (
    !currentPassword ||
    currentPassword.length > MAX_PASSWORD_LENGTH ||
    !Number.isInteger(expectedVersion) ||
    (expectedVersion as number) < 0 ||
    (requestedEmail === undefined && newPassword === undefined)
  ) {
    return invalidRequest()
  }

  if (requestedEmail !== undefined && (!EMAIL_PATTERN.test(requestedEmail) || requestedEmail.length > 254)) {
    return invalidRequest('Informe um e-mail válido.')
  }

  if (newPassword !== undefined) {
    if (
      newPassword.length < 12 ||
      newPassword.length > MAX_PASSWORD_LENGTH ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      newPassword !== confirmPassword ||
      newPassword === currentPassword
    ) {
      return invalidRequest('A nova senha não atende aos requisitos de segurança.')
    }
  }

  let effectiveCredential
  try {
    effectiveCredential = getEffectiveAdminCredential()
  } catch {
    return NextResponse.json({ error: 'Não foi possível validar as credenciais.' }, { status: 500 })
  }

  const rateLimitKey = getRateLimitKey()
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde antes de tentar novamente.' },
      { status: 429 },
    )
  }

  let currentPasswordValid = false
  try {
    currentPasswordValid = await bcrypt.compare(
      currentPassword,
      effectiveCredential.passwordHash,
    )
  } catch {
    currentPasswordValid = false
  }

  if (!currentPasswordValid) {
    return NextResponse.json({ error: 'Não foi possível validar as credenciais.' }, { status: 403 })
  }

  let passwordHash: string | undefined
  if (newPassword !== undefined) {
    passwordHash = await bcrypt.hash(newPassword, 12)
  }

  try {
    const result = updateAdminCredentials({
      expectedVersion: expectedVersion as number,
      email: requestedEmail,
      passwordHash,
    })
    clearRateLimit(rateLimitKey)

    return NextResponse.json({
      ok: true,
      credentialVersion: result.credentialVersion,
      reauthenticate: true,
    })
  } catch (error) {
    if (error instanceof AdminCredentialError && error.code === 'version_conflict') {
      return NextResponse.json(
        { error: 'As credenciais foram alteradas em outra sessão. Recarregue e tente novamente.' },
        { status: 409 },
      )
    }

    if (error instanceof AdminCredentialError && error.code === 'invalid_input') {
      return invalidRequest()
    }

    return NextResponse.json({ error: 'Não foi possível alterar as credenciais.' }, { status: 500 })
  }
}
