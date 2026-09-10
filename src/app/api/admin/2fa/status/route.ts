import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isTwoFactorEnabled, getAvailableBackupCodesCount } from '@/lib/totp'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const enabled = isTwoFactorEnabled()
  const backupCodesCount = enabled ? getAvailableBackupCodesCount('default') : 0

  return NextResponse.json({ enabled, backupCodesCount })
}

