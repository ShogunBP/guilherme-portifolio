import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  getTwoFactorRecord,
  verifyTotpCode,
} from '@/lib/totp'
import {
  create2FaVerifiedToken,
  create2FaStatusToken,
  COOKIE_OPTIONS_VERIFIED,
  COOKIE_OPTIONS_STATUS,
} from '@/lib/totp-token'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Código de verificação obrigatório' },
        { status: 400 }
      )
    }

    const record = getTwoFactorRecord()
    // Se 2FA não estiver ativo no banco, libera imediatamente
    if (!record || record.enabled !== 1) {
      const redirectCookie = req.cookies.get('admin_redirect')?.value
      const safeRedirect =
        redirectCookie && redirectCookie.startsWith('/') ? redirectCookie : '/admin'

      const response = NextResponse.json({
        success: true,
        redirect: safeRedirect,
      })
      response.cookies.delete('admin_redirect')
      return response
    }

    const isValid = verifyTotpCode(record.secret, code)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Código incorreto. Tente novamente.' },
        { status: 400 }
      )
    }

    // Código válido! Emite token de 7 dias
    const verifiedToken = await create2FaVerifiedToken()
    const statusToken = await create2FaStatusToken(true)

    const redirectCookie = req.cookies.get('admin_redirect')?.value
    const safeRedirect =
      redirectCookie && redirectCookie.startsWith('/') ? redirectCookie : '/admin'

    const response = NextResponse.json({
      success: true,
      redirect: safeRedirect,
    })

    response.cookies.set({
      ...COOKIE_OPTIONS_VERIFIED,
      value: verifiedToken,
    })

    response.cookies.set({
      ...COOKIE_OPTIONS_STATUS,
      value: statusToken,
    })

    response.cookies.delete('admin_redirect')

    return response
  } catch (error) {
    console.error('[2FA Verify Error]', error)
    return NextResponse.json(
      { error: 'Ocorreu um erro ao validar o código' },
      { status: 500 }
    )
  }
}
