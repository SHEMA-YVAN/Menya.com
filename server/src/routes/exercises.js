import { Router } from 'express'
import db from '../db.js'
import { requireAdmin } from '../auth.js'

const router = Router()
const newId = () => `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

function rowToExercise(r) {
  return { ...r, options: JSON.parse(r.options || '[]') }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM exercises ORDER BY created_at DESC').all()
  res.json(rows.map(rowToExercise))
})

router.get('/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id)
  if (!r) return res.status(404).json({ error: 'Not found' })
  res.json(rowToExercise(r))
})

router.post('/', requireAdmin, (req, res) => {
  const e = req.body
  if (!e.question || !Array.isArray(e.options) || e.options.length < 2) {
    return res.status(400).json({ error: 'A question and at least 2 options are required.' })
  }
  const id = newId()
  db.prepare(`
    INSERT INTO exercises (id, question, subject, level, difficulty, options, answer, explanation)
    VALUES (@id, @question, @subject, @level, @difficulty, @options, @answer, @explanation)
  `).run({
    id,
    question: e.question,
    subject: e.subject,
    level: e.level,
    difficulty: e.difficulty || 'Medium',
    options: JSON.stringify(e.options),
    answer: Number(e.answer) || 0,
    explanation: e.explanation || '',
  })
  res.status(201).json(rowToExercise(db.prepare('SELECT * FROM exercises WHERE id = ?').get(id)))
})

router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  const e = req.body
  db.prepare(`
    UPDATE exercises SET question=@question, subject=@subject, level=@level,
      difficulty=@difficulty, options=@options, answer=@answer, explanation=@explanation WHERE id=@id
  `).run({
    id: req.params.id,
    question: e.question ?? existing.question,
    subject: e.subject ?? existing.subject,
    level: e.level ?? existing.level,
    difficulty: e.difficulty ?? existing.difficulty,
    options: e.options ? JSON.stringify(e.options) : existing.options,
    answer: e.answer != null ? Number(e.answer) : existing.answer,
    explanation: e.explanation ?? existing.explanation,
  })
  res.json(rowToExercise(db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id)))
})

router.delete('/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
