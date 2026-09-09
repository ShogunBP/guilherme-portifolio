import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isTwoFactorEnabled } from '@/lib/totp'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const enabled = isTwoFactorEnabled()
  return NextResponse.json({ enabled })
}
