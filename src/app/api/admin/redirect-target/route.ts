import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isTwoFactorEnabled } from '@/lib/totp'
import { COOKIE_2FA_VERIFIED, verify2FaVerifiedToken } from '@/lib/totp-token'

export async function GET() {
  const cookieStore = await cookies()
  const redirectCookie = cookieStore.get('admin_redirect')
  const rawTarget = redirectCookie?.value ?? '/admin'
  const defaultTarget = rawTarget.startsWith('/') && !rawTarget.startsWith('//') ? rawTarget : '/admin'

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

