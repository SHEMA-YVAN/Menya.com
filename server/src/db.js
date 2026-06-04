import initSqlJs from 'sql.js'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

/**
 * Database layer using sql.js (pure WebAssembly SQLite).
 *
 * Why sql.js instead of better-sqlite3?
 *   better-sqlite3 is a NATIVE module that must compile on install — that fails
 *   on some setups (no build tools / newer Node / offline). sql.js is pure WASM:
 *   no compilation, no native build, works on any Node version and OS.
 *
 * sql.js runs in memory, so we persist the whole DB to `data.db` after every
 * write. For an MVP/admin tool this is perfectly fine.
 *
 * This module exposes a small better-sqlite3-compatible wrapper
 * (`prepare().get/all/run`, `exec`, `pragma`) so the rest of the code is unchanged.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// DB file location can be overridden via env (e.g. a mounted persistent disk).
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '..', 'data.db')

const SQL = await initSqlJs()

// Load existing DB file if present, else start fresh
let sqldb
if (fs.existsSync(DB_PATH)) {
  sqldb = new SQL.Database(fs.readFileSync(DB_PATH))
} else {
  sqldb = new SQL.Database()
}

function persist() {
  const data = sqldb.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

// ---- better-sqlite3-compatible wrapper -------------------------------------

function bindValues(stmt, params) {
  // Accept either positional args or a single named-params object (@name / :name).
  if (params.length === 1 && params[0] && typeof params[0] === 'object' && !Array.isArray(params[0])) {
    const obj = params[0]
    const named = {}
    for (const k of Object.keys(obj)) named[`@${k}`] = normalize(obj[k])
    stmt.bind(named)
  } else if (params.length) {
    stmt.bind(params.map(normalize))
  }
}

function normalize(v) {
  if (v === undefined) return null
  if (typeof v === 'boolean') return v ? 1 : 0
  return v
}

function makeStatement(sql) {
  const isSelect = /^\s*select/i.test(sql) || /returning/i.test(sql)
  return {
    get(...params) {
      const stmt = sqldb.prepare(sql)
      bindValues(stmt, params)
      let row = null
      if (stmt.step()) row = stmt.getAsObject()
      stmt.free()
      return row
    },
    all(...params) {
      const stmt = sqldb.prepare(sql)
      bindValues(stmt, params)
      const rows = []
      while (stmt.step()) rows.push(stmt.getAsObject())
      stmt.free()
      return rows
    },
    run(...params) {
      const stmt = sqldb.prepare(sql)
      bindValues(stmt, params)
      stmt.step()
      stmt.free()
      const changes = sqldb.getRowsModified()
      persist()
      return { changes }
    },
  }
}

const db = {
  prepare: (sql) => makeStatement(sql),
  exec: (sql) => {
    sqldb.run(sql)
    persist()
  },
  pragma: (p) => {
    try { sqldb.run(`PRAGMA ${p};`) } catch { /* ignore unsupported pragmas */ }
  },
}

/* ---------------------------------------------------------------- schema */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT '',
    email TEXT,
    role TEXT DEFAULT 'student',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type TEXT NOT NULL,     -- 'book' | 'paper'
    item_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, item_type, item_id)
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    author TEXT DEFAULT 'REB',
    year INTEGER,
    pages INTEGER,
    lang TEXT DEFAULT 'English',
    rating REAL DEFAULT 4.5,
    downloads INTEGER DEFAULT 0,
    cover INTEGER DEFAULT 1,
    cover_file TEXT,
    pdf_file TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    year INTEGER NOT NULL,
    type TEXT DEFAULT 'National Exam',
    duration TEXT DEFAULT '2h 00',
    questions INTEGER DEFAULT 50,
    downloads INTEGER DEFAULT 0,
    pdf_file TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Medium',
    options TEXT NOT NULL,
    answer INTEGER DEFAULT 0,
    explanation TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,          -- 'new_book' | 'new_paper' | 'new_user' | 'system'
    title TEXT NOT NULL,
    body TEXT DEFAULT '',
    link TEXT DEFAULT '',
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type TEXT NOT NULL,     -- 'book' | 'paper'
    item_id TEXT NOT NULL,
    title TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quiz_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT DEFAULT '',
    level TEXT DEFAULT '',
    total INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

/* ---- lightweight migrations for existing databases (add missing columns) -- */
function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all()
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
  }
}
ensureColumn('users', 'name', "name TEXT DEFAULT ''")
ensureColumn('users', 'email', 'email TEXT')
ensureColumn('users', 'role', "role TEXT DEFAULT 'student'")
ensureColumn('users', 'notify_enabled', 'notify_enabled INTEGER DEFAULT 1')

/* ---------------------------------------------------------- default admin */
export function ensureAdmin() {
  const adminCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n
  if (adminCount === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'menya2026'
    const hash = bcrypt.hashSync(password, 10)
    // Upsert: if a user with this username exists, promote; else create.
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existing) {
      db.prepare("UPDATE users SET role = 'admin', password_hash = ? WHERE id = ?").run(hash, existing.id)
    } else {
      db.prepare(
        "INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, 'Administrator', 'admin')"
      ).run(username, hash)
    }
    console.log(`👤 Ensured admin user: "${username}"`)
  }
}

export default db

