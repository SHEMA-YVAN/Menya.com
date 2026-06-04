import { Router } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import db from '../db.js'
import { requireAdmin, requireAuthFlexible } from '../auth.js'
import { uploadBook, UPLOAD_ROOT } from '../upload.js'
import { notifyEveryone } from '../notify.js'

const router = Router()

// Build a clean, human-friendly download filename
function safeName(str) {
  return String(str || 'document').replace(/[^a-z0-9\-_. ]/gi, '').trim().replace(/\s+/g, '-')
}

const newId = () => `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

function rowToBook(r) {
  return {
    ...r,
    coverUrl: r.cover_file ? `/uploads/books/${r.cover_file}` : null,
    pdfUrl: r.pdf_file ? `/uploads/books/${r.pdf_file}` : null,
  }
}

// PUBLIC: list all books
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all()
  res.json(rows.map(rowToBook))
})

// PUBLIC: single book
router.get('/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id)
  if (!r) return res.status(404).json({ error: 'Not found' })
  res.json(rowToBook(r))
})

// PUBLIC: increment download counter
router.post('/:id/download', (req, res) => {
  db.prepare('UPDATE books SET downloads = downloads + 1 WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// PUBLIC: force-download the actual PDF with a clean filename
router.get('/:id/file', requireAuthFlexible, (req, res) => {
  const r = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id)
  if (!r || !r.pdf_file) return res.status(404).json({ error: 'No file available for this book.' })
  const abs = path.join(UPLOAD_ROOT, 'books', r.pdf_file)
  if (!fs.existsSync(abs)) return res.status(404).json({ error: 'File missing on server.' })
  db.prepare('UPDATE books SET downloads = downloads + 1 WHERE id = ?').run(req.params.id)
  // Record this download in the user's history
  if (req.user?.uid) {
    db.prepare('INSERT INTO downloads (user_id, item_type, item_id, title) VALUES (?, ?, ?, ?)')
      .run(req.user.uid, 'book', r.id, r.title)
  }
  res.download(abs, `${safeName(r.title)}.pdf`)
})

// ADMIN: create
router.post('/', requireAdmin, uploadBook, (req, res) => {
  const b = req.body
  const id = newId()
  const cover_file = req.files?.cover?.[0]?.filename || null
  const pdf_file = req.files?.pdf?.[0]?.filename || null
  db.prepare(`
    INSERT INTO books (id, title, subject, level, author, year, pages, lang, rating, cover, cover_file, pdf_file)
    VALUES (@id, @title, @subject, @level, @author, @year, @pages, @lang, @rating, @cover, @cover_file, @pdf_file)
  `).run({
    id,
    title: b.title,
    subject: b.subject,
    level: b.level,
    author: b.author || 'REB',
    year: Number(b.year) || new Date().getFullYear(),
    pages: Number(b.pages) || 0,
    lang: b.lang || 'English',
    rating: Number(b.rating) || 4.5,
    cover: Number(b.cover) || Math.floor(Math.random() * 18) + 1,
    cover_file,
    pdf_file,
  })
  notifyEveryone({
    type: 'new_book',
    title: 'New book added',
    body: `“${b.title}” (${b.subject} · ${b.level}) is now available.`,
    link: '/books',
  })
  res.status(201).json(rowToBook(db.prepare('SELECT * FROM books WHERE id = ?').get(id)))
})

// ADMIN: update
router.put('/:id', requireAdmin, uploadBook, (req, res) => {
  const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  const b = req.body
  const cover_file = req.files?.cover?.[0]?.filename || existing.cover_file
  const pdf_file = req.files?.pdf?.[0]?.filename || existing.pdf_file
  db.prepare(`
    UPDATE books SET title=@title, subject=@subject, level=@level, author=@author,
      year=@year, pages=@pages, lang=@lang, rating=@rating, cover=@cover,
      cover_file=@cover_file, pdf_file=@pdf_file WHERE id=@id
  `).run({
    id: req.params.id,
    title: b.title ?? existing.title,
    subject: b.subject ?? existing.subject,
    level: b.level ?? existing.level,
    author: b.author ?? existing.author,
    year: Number(b.year) || existing.year,
    pages: Number(b.pages) || existing.pages,
    lang: b.lang ?? existing.lang,
    rating: Number(b.rating) || existing.rating,
    cover: Number(b.cover) || existing.cover,
    cover_file,
    pdf_file,
  })
  res.json(rowToBook(db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id)))
})

// ADMIN: delete
router.delete('/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
