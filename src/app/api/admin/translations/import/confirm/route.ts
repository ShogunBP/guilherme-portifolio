import { requireCurrentAdminSession } from '@/lib/admin-session'
import { revalidatePath } from 'next/cache'
import pt from '@/i18n/locales/pt.json'
import en from '@/i18n/locales/en.json'
import { flatten } from '@/lib/i18n-utils'
import { upsertOverridesBatch, type TranslationOverrideInput } from '@/lib/translations'

interface DiffConfirmItem {
  key: string
  lang: string
  newValue: string
}

export async function POST(request: Request) {
  const session = await requireCurrentAdminSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.diff)) {
    return Response.json({ error: 'Invalid body: diff array required' }, { status: 400 })
  }

  const baseMap: Record<string, Record<string, string>> = {
    pt: flatten(pt as Record<string, unknown>),
    en: flatten(en as Record<string, unknown>),
  }

  const diff = body.diff as unknown[]
  const accepted: TranslationOverrideInput[] = []
  let ignoredCount = 0

  // Fase 1: validar e separar itens aceitos/ignorados antes de tocar no banco
  for (const rawItem of diff) {
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      ignoredCount++
      continue
    }

    const item = rawItem as Record<string, unknown>

    if (
      typeof item.key !== 'string' ||
      typeof item.lang !== 'string' ||
      typeof item.newValue !== 'string'
    ) {
      ignoredCount++
      continue
    }

    if (item.newValue.trim() === '') {
      ignoredCount++
      continue
    }

    if (!['pt', 'en'].includes(item.lang)) {
      ignoredCount++
      continue
    }

    const base = baseMap[item.lang]
    // Valida se a chave pertence aos dicionários base do idioma correspondente (propriedade própria)
    if (!base || !Object.hasOwn(base, item.key)) {
      ignoredCount++
      continue
    }

    accepted.push({ key: item.key, lang: item.lang, value: item.newValue })
  }

  // Fase 2: gravar o lote aceito em uma única transação atômica (commit ou rollback total)
  let appliedCount = 0
  try {
    appliedCount = upsertOverridesBatch(accepted)
  } catch (error) {
    console.error('Falha ao aplicar lote de traduções:', error)
    return Response.json(
      { error: 'Falha ao aplicar importação: nenhuma alteração foi gravada' },
      { status: 500 },
    )
  }

  // Invalida o layout SSR para refletir as novas traduções imediatamente
  revalidatePath('/', 'layout')

  return Response.json({ ok: true, applied: appliedCount, ignored: ignoredCount })
}
