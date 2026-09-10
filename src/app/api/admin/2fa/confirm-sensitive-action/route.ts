import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  getTwoFactorRecord,
  verifyTotpCode,
  verifyAndConsumeBackupCode,
  disableTwoFactorAndInvalidateBackups,
  resetTwoFactorSecret,
} from '@/lib/totp'
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
    const { action, code, type } = body

    if (!action || (action !== 'disable' && action !== 'reset')) {
      return NextResponse.json(
        { error: 'invalid_action', message: 'Ação inválida. Escolha disable ou reset.' },
        { status: 400 }
      )
    }

    if (!type || (type !== 'totp' && type !== 'backup' && type !== 'email')) {
      return NextResponse.json(
        { error: 'invalid_type', message: 'Tipo de confirmação inválido.' },
        { status: 400 }
      )
    }

    // Validação de pendência de e-mail
    if (type === 'email') {
      return NextResponse.json(
        {
          error: 'email_not_implemented',
          message: 'Confirmação por e-mail ainda não está disponível nesta fase.',
        },
        { status: 400 }
      )
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { error: 'invalid_code', message: 'Código de confirmação é obrigatório.' },
        { status: 400 }
      )
    }

    const record = getTwoFactorRecord()
    if (!record || record.enabled !== 1 || !record.secret) {
      return NextResponse.json(
        { error: '2fa_not_enabled', message: 'O 2FA não está ativo no momento.' },
        { status: 400 }
      )
    }

    // 1. Validação pelo método escolhido
    if (type === 'totp') {
      const isValid = verifyTotpCode(record.secret, code.trim())
      if (!isValid) {
        return NextResponse.json(
          { error: 'invalid_code', message: 'Código TOTP incorreto. Verifique seu app autenticador.' },
          { status: 401 }
        )
      }
    } else if (type === 'backup') {
      const result = await verifyAndConsumeBackupCode(code.trim(), 'default')
      if (!result.success) {
        if (result.reason === 'already_used') {
          return NextResponse.json(
            { error: 'invalid_code', reason: 'already_used', message: 'Este código de backup já foi utilizado anteriormente.' },
            { status: 401 }
          )
        }
        return NextResponse.json(
          { error: 'invalid_code', reason: result.reason, message: 'Código de backup incorreto ou não encontrado.' },
          { status: 401 }
        )
      }
    }

    // 2. Execução da Ação Sensível Autorizada
    const statusToken = await create2FaStatusToken(false)

    if (action === 'disable') {
      disableTwoFactorAndInvalidateBackups('default')

      const response = NextResponse.json({
        success: true,
        action: 'disable',
        message: '2FA desativado com sucesso.',
        redirectTo: '/admin/security',
      })

      response.cookies.set({
        ...COOKIE_OPTIONS_STATUS,
        value: statusToken,
      })
      response.cookies.delete(COOKIE_2FA_VERIFIED)

      return response
    }

    if (action === 'reset') {
      resetTwoFactorSecret('default')

      const response = NextResponse.json({
        success: true,
        action: 'reset',
        message: '2FA redefinido com sucesso. Redirecionando para novo setup.',
        redirectTo: '/admin/setup-2fa',
      })

      response.cookies.set({
        ...COOKIE_OPTIONS_STATUS,
        value: statusToken,
      })
      response.cookies.delete(COOKIE_2FA_VERIFIED)

      return response
    }

    return NextResponse.json({ error: 'invalid_action' }, { status: 400 })
  } catch (error) {
    console.error('[2FA Confirm Sensitive Action Error]', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Ocorreu um erro ao processar a ação sensível.' },
      { status: 500 }
    )
  }
}
