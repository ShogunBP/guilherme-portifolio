// GET /api/translations?lang=pt
// Pública — sem autenticação. Retorna apenas os overrides ativos do idioma pedido.
import { NextRequest, NextResponse } from 'next/server'
import { getOverridesByLang } from '@/lib/translations'

export async function GET(request: NextRequest) {
  const rawLang = request.nextUrl.searchParams.get('lang') || 'pt'
  
  // Normalização tolerante a subtags regionais (ex: pt-BR -> pt, en-US -> en)
  const lang = rawLang.toLowerCase().startsWith('en') ? 'en' : 'pt'

  const overrides = getOverridesByLang(lang)
  return NextResponse.json(overrides)
}
