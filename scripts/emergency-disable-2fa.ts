/**
 * ============================================================
 * SCRIPT DE EMERGÊNCIA — Desativação do 2FA via SSH
 * ============================================================
 *
 * ⚠️  AVISO DE SEGURANÇA CRÍTICO:
 * Este script acessa diretamente o banco de dados SQLite e
 * modifica registros de autenticação sem passar por nenhum
 * mecanismo de autenticação web.
 *
 * ❌ NUNCA exponha este script via rota HTTP, API, formulário
 *    web ou qualquer interface acessível pela internet.
 *
 * ✅ USE APENAS via SSH diretamente no servidor VPS.
 *    O acesso SSH com chave privada É o único controle de
 *    autorização para este script.
 *
 * ============================================================
 * COMO USAR (via SSH na VPS):
 *
 *   cd /caminho/do/projeto
 *   npx tsx scripts/emergency-disable-2fa.ts
 *
 * Ou, se tsx não estiver disponível globalmente:
 *   node --loader ts-node/esm scripts/emergency-disable-2fa.ts
 *
 * ============================================================
 * O QUE ESTE SCRIPT FAZ:
 *   1. Lê o caminho do banco via DATABASE_PATH (ou fallback)
 *   2. Verifica se o 2FA está ativo
 *   3. Se ativo: desativa (enabled = 0) e invalida todos os
 *      códigos de backup existentes
 *   4. Imprime o resultado claramente no terminal
 *
 * O QUE ESTE SCRIPT NÃO FAZ:
 *   ❌ Não envia requisições HTTP
 *   ❌ Não depende do servidor Next.js estar rodando
 *   ❌ Não apaga o secret TOTP (apenas desativa o enabled)
 *   ❌ Não requer autenticação web de nenhum tipo
 * ============================================================
 */

import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

// ── Resolução do caminho do banco ─────────────────────────────────────────────
function resolveDatabasePath(): string {
  const raw =
    process.env.DATABASE_PATH ||
    process.env.DATABASE_URL ||
    './data/portfolio.db'

  const cleaned = raw.replace(/^file:/, '')
  return path.isAbsolute(cleaned) ? cleaned : path.join(process.cwd(), cleaned)
}

// ── Execução principal ────────────────────────────────────────────────────────
function main() {
  const dbPath = resolveDatabasePath()

  console.log('\n============================================================')
  console.log('  SCRIPT DE EMERGÊNCIA — Desativação de 2FA')
  console.log('============================================================')
  console.log(`  Banco de dados: ${dbPath}`)

  // Verificar existência do arquivo
  if (!fs.existsSync(dbPath)) {
    console.error(`\n  ❌ ERRO: Arquivo de banco não encontrado em:\n     ${dbPath}`)
    console.error('  Verifique se DATABASE_PATH está configurado corretamente.')
    process.exit(1)
  }

  const db = new Database(dbPath)

  try {
    // Verificar status atual do 2FA
    const record = db
      .prepare("SELECT enabled FROM two_factor_auth WHERE id = 'default'")
      .get() as { enabled: number } | undefined

    if (!record) {
      console.log('\n  ℹ️  O 2FA nunca foi configurado neste sistema.')
      console.log('     Nenhuma alteração necessária.\n')
      process.exit(0)
    }

    if (record.enabled === 0) {
      console.log('\n  ℹ️  O 2FA já está desativado neste sistema.')
      console.log('     Nenhuma alteração necessária.\n')
      process.exit(0)
    }

    // 2FA está ativo — desativar e invalidar backups
    console.log('\n  🔒 2FA está ATIVO. Iniciando desativação de emergência...\n')

    // Transação atômica: desativar + invalidar backups
    const disableTransaction = db.transaction(() => {
      // 1. Desativar o 2FA
      db.prepare(`
        UPDATE two_factor_auth
        SET enabled = 0, updated_at = datetime('now')
        WHERE id = 'default'
      `).run()

      // 2. Invalidar todos os códigos de backup pendentes
      const result = db.prepare(`
        UPDATE two_factor_backup_codes
        SET used = 1, used_at = datetime('now')
        WHERE user_id = 'default' AND used = 0
      `).run()

      return result.changes
    })

    const invalidatedCount = disableTransaction()

    console.log('  ✅ 2FA desativado com sucesso!')
    console.log(`  ✅ ${invalidatedCount} código(s) de backup invalidado(s).`)
    console.log('\n  ⚡ O próximo login exigirá apenas o primeiro fator')
    console.log('     (e-mail/senha ou login social).')
    console.log('\n  📋 Próximos passos recomendados:')
    console.log('     1. Faça login normalmente em /admin/login')
    console.log('     2. Reative o 2FA em /admin/security quando recuperar')
    console.log('        o acesso ao seu aplicativo autenticador.')
    console.log('\n============================================================\n')
  } finally {
    db.close()
  }
}

main()
