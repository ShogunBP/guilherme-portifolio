import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  generateTotpSecret,
  generateTotpUri,
  generateTotpQrCode,
  savePendingTotpSecret,
} from '@/lib/totp'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const secret = generateTotpSecret()
    const uri = generateTotpUri(secret, session.user.email || 'admin')
    const qrCodeUrl = await generateTotpQrCode(uri)

    // Salva o segredo pendente no SQLite (com enabled = 0)
    savePendingTotpSecret(secret)

    return NextResponse.json({
      secret,
      qrCodeUrl,
    })
  } catch (error) {
    console.error('[2FA Setup Error]', error)
    return NextResponse.json(
      { error: 'Falha ao gerar dados de configuração do 2FA' },
      { status: 500 }
    )
  }
}
