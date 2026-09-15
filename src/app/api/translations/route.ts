// GET /api/translations?lang=pt
// Pública — sem autenticação. Retorna apenas os overrides ativos do idioma pedido.
import { NextRequest, NextResponse } from 'next/server'
import { getOverridesByLang } from '@/lib/translations'

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') || 'pt'
  if (!['pt', 'en'].includes(lang)) {
    return NextResponse.json({}, { status: 400 })
  }
  const overrides = getOverridesByLang(lang)
  return NextResponse.json(overrides)
}
