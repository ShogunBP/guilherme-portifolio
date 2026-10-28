import { auth } from '@/auth'
import pt from '@/i18n/locales/pt.json'
import en from '@/i18n/locales/en.json'
import { flatten } from '@/lib/i18n-utils'
import { getOverridesByLang } from '@/lib/translations'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const categoriesParam = url.searchParams.get('categories')
  const langsParam = url.searchParams.get('langs')

  const selectedCategories = categoriesParam
    ? categoriesParam.split(',').map(c => c.trim()).filter(Boolean)
    : []

  const requestedLangs = langsParam
    ? langsParam.split(',').map(l => l.trim().toLowerCase()).filter(l => l === 'pt' || l === 'en')
    : ['pt', 'en']

  const activeLangs = requestedLangs.length > 0 ? requestedLangs : ['pt', 'en']

  const baseMap: Record<string, Record<string, string>> = {
    pt: flatten(pt as Record<string, unknown>),
    en: flatten(en as Record<string, unknown>),
  }

  const result: Record<string, Record<string, string>> = {}

  for (const lang of activeLangs) {
    const base = baseMap[lang] || {}
    const overrides = getOverridesByLang(lang)
    const merged = { ...base, ...overrides }

    if (selectedCategories.length === 0) {
      result[lang] = merged
    } else {
      const filtered: Record<string, string> = {}
      for (const [key, val] of Object.entries(merged)) {
        const matchesCategory = selectedCategories.some(cat => key.startsWith(`${cat}.`))
        if (matchesCategory) {
          filtered[key] = val
        }
      }
      result[lang] = filtered
    }
  }

  return Response.json(result)
}
