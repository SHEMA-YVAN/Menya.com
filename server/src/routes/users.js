import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { requireAuth, requireAdmin, changePassword, getUserById } from '../auth.js'

const router = Router()

/* -------------------------------------------------- current user (profile) */
router.get('/me', requireAuth, (req, res) => {
  const user = getUserById(req.user.uid)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  res.json(user)
})

router.patch('/me', requireAuth, (req, res) => {
  const { name, notifyEnabled } = req.body || {}
  if (name != null) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(String(name).trim(), req.user.uid)
  }
  if (notifyEnabled != null) {
    db.prepare('UPDATE users SET notify_enabled = ? WHERE id = ?').run(notifyEnabled ? 1 : 0, req.user.uid)
  }
  res.json(getUserById(req.user.uid))
})

/* --------------------------------------------------- download history & scores */
router.get('/me/downloads', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT item_type, item_id, title, created_at FROM downloads WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
    .all(req.user.uid)
  res.json(rows)
})

router.get('/me/scores', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT subject, level, total, correct, created_at FROM quiz_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
    .all(req.user.uid)
  res.json(rows)
})

router.post('/me/scores', requireAuth, (req, res) => {
  const { subject = '', level = '', total, correct } = req.body || {}
  if (typeof total !== 'number' || typeof correct !== 'number') {
    return res.status(400).json({ error: 'total and correct are required numbers.' })
  }
  db.prepare('INSERT INTO quiz_scores (user_id, subject, level, total, correct) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.uid, subject, level, total, correct)
  res.status(201).json({ ok: true })
})

router.post('/me/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  const result = changePassword(req.user.uid, currentPassword, newPassword)
  if (result.error) return res.status(400).json(result)
  res.json({ ok: true })
})

/** Self-service account deletion. Last admin cannot delete themselves. */
router.delete('/me', requireAuth, (req, res) => {
  const me = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.uid)
  if (me?.role === 'admin') {
    const admins = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n
    if (admins <= 1) return res.status(400).json({ error: 'The last admin cannot delete their account.' })
  }
  db.prepare('DELETE FROM bookmarks WHERE user_id = ?').run(req.user.uid)
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.uid)
  res.json({ ok: true })
})

/* ----------------------------------------------------------------- bookmarks */
router.get('/me/bookmarks', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT item_type, item_id, created_at FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.uid)
  res.json(rows)
})

router.post('/me/bookmarks', requireAuth, (req, res) => {
  const { itemType, itemId } = req.body || {}
  if (!['book', 'paper'].includes(itemType) || !itemId) {
    return res.status(400).json({ error: 'Invalid bookmark.' })
  }
  db.prepare(
    'INSERT OR IGNORE INTO bookmarks (user_id, item_type, item_id) VALUES (?, ?, ?)'
  ).run(req.user.uid, itemType, itemId)
  res.json({ ok: true })
})

router.delete('/me/bookmarks/:itemType/:itemId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND item_type = ? AND item_id = ?').run(
    req.user.uid,
    req.params.itemType,
    req.params.itemId
  )
  res.json({ ok: true })
})

/* ------------------------------------------------------------- admin: users */
router.get('/', requireAdmin, (req, res) => {
  const rows = db
    .prepare('SELECT id, username, name, email, role, created_at FROM users ORDER BY created_at DESC')
    .all()
  res.json(rows)
})

/** Admin creates a new user account directly. */
router.post('/', requireAdmin, (req, res) => {
  let { name, email, password, role } = req.body || {}
  name = String(name || '').trim()
  email = String(email || '').trim().toLowerCase()
  role = role === 'admin' ? 'admin' : 'student'
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' })
  if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  const exists = db.prepare('SELECT id FROM users WHERE lower(email) = ? OR lower(username) = ?').get(email, email)
  if (exists) return res.status(400).json({ error: 'A user with this email already exists.' })
  db.prepare("INSERT INTO users (username, password_hash, name, email, role) VALUES (?, ?, ?, ?, ?)")
    .run(email, bcrypt.hashSync(password, 10), name, email, role)
  res.status(201).json({ ok: true })
})

router.patch('/:id/role', requireAdmin, (req, res) => {
  const { role } = req.body || {}
  if (!['student', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role.' })
  // Prevent removing the last admin
  if (role !== 'admin') {
    const admins = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n
    const target = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id)
    if (target?.role === 'admin' && admins <= 1) {
      return res.status(400).json({ error: 'Cannot demote the last remaining admin.' })
    }
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id)
  res.json({ ok: true })
})

/** Admin-assisted password reset for a locked-out user. */
router.post('/:id/reset-password', requireAdmin, (req, res) => {
  const { newPassword } = req.body || {}
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' })
  }
  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id)
  if (!target) return res.status(404).json({ error: 'User not found.' })
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  if (Number(req.params.id) === Number(req.user.uid)) {
    return res.status(400).json({ error: 'You cannot delete your own account.' })
  }
  db.prepare('DELETE FROM bookmarks WHERE user_id = ?').run(req.params.id)
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'User not found.' })
  res.json({ ok: true })
})

export default router
