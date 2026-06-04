import { Router } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import db from '../db.js'
import { requireAdmin, requireAuthFlexible } from '../auth.js'
import { uploadPaper, UPLOAD_ROOT } from '../upload.js'
import { notifyEveryone } from '../notify.js'

const router = Router()
const newId = () => `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

function safeName(str) {
  return String(str || 'document').replace(/[^a-z0-9\-_. ]/gi, '').trim().replace(/\s+/g, '-')
}

function rowToPaper(r) {
  return { ...r, pdfUrl: r.pdf_file ? `/uploads/papers/${r.pdf_file}` : null }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM papers ORDER BY created_at DESC').all()
  res.json(rows.map(rowToPaper))
})

router.get('/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM papers WHERE id = ?').get(req.params.id)
  if (!r) return res.status(404).json({ error: 'Not found' })
  res.json(rowToPaper(r))
})

router.post('/:id/download', (req, res) => {
  db.prepare('UPDATE papers SET downloads = downloads + 1 WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// PUBLIC: force-download the actual PDF with a clean filename
router.get('/:id/file', requireAuthFlexible, (req, res) => {
  const r = db.prepare('SELECT * FROM papers WHERE id = ?').get(req.params.id)
  if (!r || !r.pdf_file) return res.status(404).json({ error: 'No file available for this paper.' })
  const abs = path.join(UPLOAD_ROOT, 'papers', r.pdf_file)
  if (!fs.existsSync(abs)) return res.status(404).json({ error: 'File missing on server.' })
  db.prepare('UPDATE papers SET downloads = downloads + 1 WHERE id = ?').run(req.params.id)
  if (req.user?.uid) {
    db.prepare('INSERT INTO downloads (user_id, item_type, item_id, title) VALUES (?, ?, ?, ?)')
      .run(req.user.uid, 'paper', r.id, `${r.subject} ${r.level} ${r.year}`)
  }
  res.download(abs, `${safeName(r.subject + '-' + r.level + '-' + r.year)}.pdf`)
})

router.post('/', requireAdmin, uploadPaper, (req, res) => {
  const p = req.body
  const id = newId()
  const pdf_file = req.file?.filename || null
  db.prepare(`
    INSERT INTO papers (id, subject, level, year, type, duration, questions, pdf_file)
    VALUES (@id, @subject, @level, @year, @type, @duration, @questions, @pdf_file)
  `).run({
    id,
    subject: p.subject,
    level: p.level,
    year: Number(p.year) || new Date().getFullYear(),
    type: p.type || 'National Exam',
    duration: p.duration || '2h 00',
    questions: Number(p.questions) || 50,
    pdf_file,
  })
  notifyEveryone({
    type: 'new_paper',
    title: 'New past paper added',
    body: `${p.subject} ${p.level} (${p.year}) is now available.`,
    link: '/past-papers',
  })
  res.status(201).json(rowToPaper(db.prepare('SELECT * FROM papers WHERE id = ?').get(id)))
})

router.put('/:id', requireAdmin, uploadPaper, (req, res) => {
  const existing = db.prepare('SELECT * FROM papers WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  const p = req.body
  const pdf_file = req.file?.filename || existing.pdf_file
  db.prepare(`
    UPDATE papers SET subject=@subject, level=@level, year=@year, type=@type,
      duration=@duration, questions=@questions, pdf_file=@pdf_file WHERE id=@id
  `).run({
    id: req.params.id,
    subject: p.subject ?? existing.subject,
    level: p.level ?? existing.level,
    year: Number(p.year) || existing.year,
    type: p.type ?? existing.type,
    duration: p.duration ?? existing.duration,
    questions: Number(p.questions) || existing.questions,
    pdf_file,
  })
  res.json(rowToPaper(db.prepare('SELECT * FROM papers WHERE id = ?').get(req.params.id)))
})

router.delete('/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM papers WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
