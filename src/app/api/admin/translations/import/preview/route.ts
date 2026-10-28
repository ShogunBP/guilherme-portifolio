import { auth } from '@/auth'
import pt from '@/i18n/locales/pt.json'
import en from '@/i18n/locales/en.json'
import { flatten } from '@/lib/i18n-utils'
import { getOverridesByLang } from '@/lib/translations'

export interface TranslationDiffItem {
  key: string
  lang: string
  currentValue: string
  newValue: string
}

export interface TranslationIgnoredItem {
  key: string
  lang: string
  reason: string
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const translations = (body.translations && typeof body.translations === 'object')
    ? body.translations
    : body

  const baseMap: Record<string, Record<string, string>> = {
    pt: flatten(pt as Record<string, unknown>),
    en: flatten(en as Record<string, unknown>),
  }

  const diff: TranslationDiffItem[] = []
  const ignored: TranslationIgnoredItem[] = []

  for (const lang of ['pt', 'en'] as const) {
    const incomingLangData = translations[lang]
    if (!incomingLangData || typeof incomingLangData !== 'object') continue

    // Suporta tanto formato plano quanto aninhado reutilizando flatten
    const incomingFlat = flatten(incomingLangData as Record<string, unknown>)
    const base = baseMap[lang]
    const overrides = getOverridesByLang(lang)

    for (const [key, val] of Object.entries(incomingFlat)) {
      // Ignora chaves que não existem no dicionário base (checagem de propriedade própria)
      if (!Object.hasOwn(base, key)) {
        ignored.push({ key, lang, reason: 'Chave não existe no dicionário base' })
        continue
      }

      // Validação de tipo: rejeita valores não-string sem coerção silenciosa (null, números, etc)
      if (typeof val !== 'string') {
        ignored.push({ key, lang, reason: 'Valor inválido (esperado string)' })
        continue
      }

      // Valor vazio: não entra no diff; entra em ignored
      if (val.trim() === '') {
        ignored.push({ key, lang, reason: 'Valor vazio' })
        continue
      }

      const newValue = val
      const currentValue = overrides[key] ?? base[key] ?? ''

      if (newValue !== currentValue) {
        diff.push({
          key,
          lang,
          currentValue,
          newValue,
        })
      }
    }
  }

  return Response.json({ diff, ignored })
}
