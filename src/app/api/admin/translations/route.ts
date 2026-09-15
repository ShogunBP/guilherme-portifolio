import { auth } from '@/auth'
import {
  getOverridesByLang,
  upsertOverride,
  deleteOverride,
  deleteAllOverrides,
} from '@/lib/translations'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const lang = url.searchParams.get('lang')

  if (lang) {
    if (!['pt', 'en'].includes(lang)) return Response.json({}, { status: 400 })
    return Response.json(getOverridesByLang(lang))
  }

  // Sem ?lang= → retorna ambos os idiomas (usado na inicialização do painel)
  return Response.json({
    pt: getOverridesByLang('pt'),
    en: getOverridesByLang('en'),
  })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.updates)) {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  for (const { key, lang, value } of body.updates) {
    if (!key || !lang || typeof value !== 'string') continue
    if (!['pt', 'en'].includes(lang)) continue
    upsertOverride(key, lang, value)
  }

  return Response.json({ ok: true })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 })

  if (body.all === true) {
    deleteAllOverrides()
    return Response.json({ ok: true })
  }

  if (Array.isArray(body.deletes)) {
    for (const { key, lang } of body.deletes) {
      if (!key || !lang) continue
      if (!['pt', 'en'].includes(lang)) continue
      deleteOverride(key, lang)
    }
    return Response.json({ ok: true })
  }

  return Response.json({ error: 'Invalid body' }, { status: 400 })
}
