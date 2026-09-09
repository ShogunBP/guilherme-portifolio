import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { disableTwoFactorAuth } from '@/lib/totp'
import {
  create2FaStatusToken,
  COOKIE_2FA_VERIFIED,
  COOKIE_OPTIONS_STATUS,
} from '@/lib/totp-token'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action } = body

    if (action === 'disable') {
      disableTwoFactorAuth()

      const statusToken = await create2FaStatusToken(false)

      const response = NextResponse.json({
        success: true,
        enabled: false,
        message: '2FA desativado com sucesso.',
      })

      // Atualiza cookie de status para false e remove cookie de verificação
      response.cookies.set({
        ...COOKIE_OPTIONS_STATUS,
        value: statusToken,
      })
      response.cookies.delete(COOKIE_2FA_VERIFIED)

      return response
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    console.error('[2FA Toggle Error]', error)
    return NextResponse.json(
      { error: 'Falha ao alterar status do 2FA' },
      { status: 500 }
    )
  }
}
