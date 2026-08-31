import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

function getDatabasePath(): string {
  const envPath = process.env.DATABASE_PATH || process.env.DATABASE_URL || './data/portfolio.db'
  // Remove 'file:' prefix if present
  const cleanPath = envPath.replace(/^file:/, '')
  return path.isAbsolute(cleanPath) ? cleanPath : path.resolve(process.cwd(), cleanPath)
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
