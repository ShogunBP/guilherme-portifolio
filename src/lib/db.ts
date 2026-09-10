import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

function getDatabasePath(): string {
  const envPath = process.env.DATABASE_PATH || process.env.DATABASE_URL || './data/portfolio.db'
  // Remove 'file:' prefix if present
  const cleanPath = envPath.replace(/^file:/, '')
  if (path.isAbsolute(cleanPath)) return cleanPath
  return path.join(/*turbopackIgnore: true*/ process.cwd(), cleanPath)
}

function initDatabase(dbPath: string): Database.Database {
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const db = new Database(dbPath)

  // Performance and concurrency settings
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')
  db.pragma('synchronous = NORMAL')

  // Initialize base schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS two_factor_auth (
      id TEXT PRIMARY KEY DEFAULT 'default',
      secret TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS two_factor_backup_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default',
      code_hash TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_backup_codes_user_used 
    ON two_factor_backup_codes(user_id, used);
  `)

  return db
}

const globalForDb = globalThis as unknown as {
  db: Database.Database | undefined
}

export const db = globalForDb.db ?? initDatabase(getDatabasePath())

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}

export default db
