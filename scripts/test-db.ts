import { db } from '../src/lib/db'

function main() {
  console.log('Testing better-sqlite3 connection and schema...')

  // Clean up previous test entry if exists
  db.prepare('DELETE FROM two_factor_auth WHERE id = ?').run('test')

  // Create record
  db.prepare(`
    INSERT INTO two_factor_auth (id, secret, enabled)
    VALUES (?, ?, ?)
  `).run('test', 'BASE32SECRETTEST123', 0)

  // Read record
  interface TwoFactorRecord {
    id: string
    secret: string
    enabled: number
    created_at: string
    updated_at: string
  }

  const fetched = db
    .prepare('SELECT * FROM two_factor_auth WHERE id = ?')
    .get('test') as TwoFactorRecord | undefined

  console.log('Fetched record:', fetched)

  if (fetched?.secret === 'BASE32SECRETTEST123') {
    console.log('✅ better-sqlite3 persistence test passed!')
  } else {
    console.error('❌ Failed: secret does not match')
    process.exit(1)
  }

  // Clean up
  db.prepare('DELETE FROM two_factor_auth WHERE id = ?').run('test')
  console.log('Test record cleaned up successfully.')
}

try {
  main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
