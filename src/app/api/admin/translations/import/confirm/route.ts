import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import pt from '@/i18n/locales/pt.json'
import en from '@/i18n/locales/en.json'
import { flatten } from '@/lib/i18n-utils'
import { upsertOverride } from '@/lib/translations'

interface DiffConfirmItem {
  key: string
  lang: string
  newValue: string
}

export async function POST(request: Request) {
  const session = await auth()
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
  let appliedCount = 0
  let ignoredCount = 0

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

    upsertOverride(item.key, item.lang, item.newValue)
    appliedCount++
  }

  // Invalida o layout SSR para refletir as novas traduções imediatamente
  revalidatePath('/', 'layout')

  return Response.json({ ok: true, applied: appliedCount, ignored: ignoredCount })
}
