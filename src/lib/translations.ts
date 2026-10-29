import db from '@/lib/db'

// Busca todos os overrides de um idioma — retorna objeto achatado { 'hero.role': 'valor', ... }
export function getOverridesByLang(lang: string): Record<string, string> {
  const rows = db.prepare(
    'SELECT key, value FROM translation_overrides WHERE lang = ?'
  ).all(lang) as { key: string; value: string }[]
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

// Upsert de um override
export function upsertOverride(key: string, lang: string, value: string): void {
  db.prepare(`
    INSERT INTO translation_overrides (key, lang, value, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(key, lang) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run(key, lang, value)
}

export interface TranslationOverrideInput {
  key: string
  lang: string
  value: string
}

/**
 * Upsert em lote dentro de uma única transação do SQLite.
 * Commit no retorno normal; rollback total se qualquer item lançar exceção.
 * Deve permanecer síncrona: é o contrato de `db.transaction()` do better-sqlite3.
 * Retorna a quantidade de itens gravados.
 */
export function upsertOverridesBatch(items: TranslationOverrideInput[]): number {
  if (items.length === 0) return 0

  const stmt = db.prepare(`
    INSERT INTO translation_overrides (key, lang, value, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(key, lang) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `)

  const runBatch = db.transaction((batch: TranslationOverrideInput[]): number => {
    let applied = 0
    for (const item of batch) {
      stmt.run(item.key, item.lang, item.value)
      applied++
    }
    return applied
  })

  return runBatch(items)
}

// Deleta um override (restaurar padrão)
export function deleteOverride(key: string, lang: string): void {
  db.prepare(
    'DELETE FROM translation_overrides WHERE key = ? AND lang = ?'
  ).run(key, lang)
}

// Deleta todos os overrides de todos os idiomas (restaurar tudo ao padrão)
export function deleteAllOverrides(): void {
  db.prepare('DELETE FROM translation_overrides').run()
}
