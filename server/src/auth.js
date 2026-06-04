import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import db from './db.js'

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me'
const TOKEN_TTL = '7d'

function publicUser(u) {
  return {
    id: u.id, username: u.username, name: u.name || '', email: u.email || '',
    role: u.role || 'student', notifyEnabled: u.notify_enabled == null ? true : !!u.notify_enabled,
  }
}

function sign(u) {
  return jwt.sign({ uid: u.id, username: u.username, role: u.role || 'student' }, SECRET, { expiresIn: TOKEN_TTL })
}

/** Log in by username OR email. */
export function login(identifier, password) {
  const id = String(identifier || '').trim().toLowerCase()
  const user = db
    .prepare('SELECT * FROM users WHERE lower(username) = ? OR lower(email) = ?')
    .get(id, id)
  if (!user) return null
  if (!bcrypt.compareSync(password, user.password_hash)) return null
  return { token: sign(user), user: publicUser(user) }
}

/** Register a new student account. Returns {token,user} or {error}. */
export function register({ name, email, password }) {
  name = String(name || '').trim()
  email = String(email || '').trim().toLowerCase()
  if (!name || !email || !password) return { error: 'Name, email and password are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' }
  if (String(password).length < 6) return { error: 'Password must be at least 6 characters.' }

  const exists = db.prepare('SELECT id FROM users WHERE lower(email) = ? OR lower(username) = ?').get(email, email)
  if (exists) return { error: 'An account with this email already exists.' }

  const hash = bcrypt.hashSync(password, 10)
  // username = email for self-registered users (unique handle)
  db.prepare("INSERT INTO users (username, password_hash, name, email, role) VALUES (?, ?, ?, ?, 'student')")
    .run(email, hash, name, email)
  // Fetch back by email (sql.js doesn't expose lastInsertRowid reliably)
  const user = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(email)
  if (!user) return { error: 'Could not create account. Please try again.' }
  return { token: sign(user), user: publicUser(user) }
}

export function changePassword(userId, currentPassword, newPassword) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user) return { error: 'User not found.' }
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) return { error: 'Current password is incorrect.' }
  if (String(newPassword).length < 6) return { error: 'New password must be at least 6 characters.' }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), userId)
  return { ok: true }
}

export function getUserById(id) {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  return u ? publicUser(u) : null
}

/** Middleware: requires a valid Bearer token. Attaches req.user. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required.' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

/**
 * Middleware for browser navigations (file downloads) where headers can't be set.
 * Accepts the token from the Authorization header OR a ?token= query param.
 * Requires the user to be logged in (any role).
 */
export function requireAuthFlexible(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token || null
  if (!token) return res.status(401).send('Please log in to download this file.')
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).send('Your session has expired. Please log in again.')
  }
}

/** Middleware: requires the authenticated user to be an admin. */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' })
    next()
  })
}
