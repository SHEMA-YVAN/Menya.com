import db from './db.js'

/**
 * Notification fan-out helpers. Notifications are stored per-user in the
 * `notifications` table and respect each user's `notify_enabled` flag.
 */

function insert(userId, { type, title, body = '', link = '' }) {
  db.prepare(
    'INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, type, title, body, link)
}

/** Notify all users with notifications enabled (optionally only a role). */
export function notifyUsers({ type, title, body = '', link = '', role = null, exceptUserId = null }) {
  let sql = 'SELECT id FROM users WHERE notify_enabled = 1'
  const params = []
  if (role) { sql += ' AND role = ?'; params.push(role) }
  if (exceptUserId) { sql += ' AND id != ?'; params.push(exceptUserId) }
  const rows = db.prepare(sql).all(...params)
  for (const r of rows) insert(r.id, { type, title, body, link })
}

/** Notify only admins (e.g. new user signed up). */
export function notifyAdmins(payload) {
  notifyUsers({ ...payload, role: 'admin' })
}

/** Notify everyone (e.g. a new book was published). */
export function notifyEveryone(payload) {
  notifyUsers(payload)
}
