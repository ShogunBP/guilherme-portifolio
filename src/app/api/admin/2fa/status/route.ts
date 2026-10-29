import { NextResponse } from 'next/server'
import { requireCurrentAdminSession } from '@/lib/admin-session'
import { isTwoFactorEnabled, getAvailableBackupCodesCount } from '@/lib/totp'

export async function GET() {
  const session = await requireCurrentAdminSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const enabled = isTwoFactorEnabled()
  const backupCodesCount = enabled ? getAvailableBackupCodesCount('default') : 0

  return NextResponse.json({ enabled, backupCodesCount })
}

