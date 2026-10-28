import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isTwoFactorEnabled } from '@/lib/totp'
import { COOKIE_2FA_VERIFIED, verify2FaVerifiedToken } from '@/lib/totp-token'
import { sanitizeLocalRedirect } from '@/lib/safe-redirect'

export async function GET() {
  const cookieStore = await cookies()
  const redirectCookie = cookieStore.get('admin_redirect')
  // Cookie é sanitizado antes de qualquer uso: apenas caminhos locais passam.
  const defaultTarget = sanitizeLocalRedirect(redirectCookie?.value)

  const enabled = isTwoFactorEnabled()
  const verifiedCookie = cookieStore.get(COOKIE_2FA_VERIFIED)?.value
  const isVerified = await verify2FaVerifiedToken(verifiedCookie)

  let redirectTo = defaultTarget
  if (enabled && !isVerified) {
    redirectTo = '/admin/verify-2fa'
  } else {
    // Limpa o cookie de redirect se o acesso estiver liberado
    cookieStore.delete('admin_redirect')
  }

  return NextResponse.json({ redirectTo })
}

