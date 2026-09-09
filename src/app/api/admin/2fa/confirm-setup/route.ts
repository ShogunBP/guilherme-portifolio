import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  getTwoFactorRecord,
  verifyTotpCode,
  enableTwoFactorAuth,
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
    if (!record || !record.secret) {
      return NextResponse.json(
        { error: 'Nenhum setup de 2FA em andamento. Recarregue a página.' },
        { status: 400 }
      )
    }

    const isValid = verifyTotpCode(record.secret, code)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado. Verifique o aplicativo autenticador.' },
        { status: 400 }
      )
    }

    // Ativa o 2FA no banco de dados SQLite
    enableTwoFactorAuth()

    // Gera tokens assinados por AUTH_SECRET (Web Crypto HMAC-SHA256)
    const verifiedToken = await create2FaVerifiedToken()
    const statusToken = await create2FaStatusToken(true)

    const response = NextResponse.json({
      success: true,
      redirect: '/admin/seguranca',
      message: '2FA ativado com sucesso!',
    })

    // Seta cookies de 7 dias
    response.cookies.set({
      ...COOKIE_OPTIONS_VERIFIED,
      value: verifiedToken,
    })

    response.cookies.set({
      ...COOKIE_OPTIONS_STATUS,
      value: statusToken,
    })

    return response
  } catch (error) {
    console.error('[2FA Confirm Setup Error]', error)
    return NextResponse.json(
      { error: 'Ocorreu um erro ao ativar o 2FA' },
      { status: 500 }
    )
  }
}
