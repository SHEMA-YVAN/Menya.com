import 'dotenv/config'
import db, { ensureAdmin } from './db.js'
import { seedBooks, seedPapers, seedExercises } from './seedData.js'

/**
 * Seeds the database with sample content the first time it runs
 * (only if the tables are empty). Safe to call on every startup.
 */
export function seedIfEmpty() {
  ensureAdmin()

  const booksCount = db.prepare('SELECT COUNT(*) AS n FROM books').get().n
  if (booksCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO books (id, title, subject, level, author, year, pages, lang, rating, downloads, cover)
      VALUES (@id, @title, @subject, @level, @author, @year, @pages, @lang, @rating, @downloads, @cover)
    `)
    seedBooks.forEach((r) => stmt.run(r))
    console.log(`📚 Seeded ${seedBooks.length} books`)
  }

  const papersCount = db.prepare('SELECT COUNT(*) AS n FROM papers').get().n
  if (papersCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO papers (id, subject, level, year, type, duration, questions, downloads)
      VALUES (@id, @subject, @level, @year, @type, @duration, @questions, @downloads)
    `)
    seedPapers.forEach((r) => stmt.run(r))
    console.log(`📝 Seeded ${seedPapers.length} past papers`)
  }

  const exCount = db.prepare('SELECT COUNT(*) AS n FROM exercises').get().n
  if (exCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO exercises (id, question, subject, level, difficulty, options, answer, explanation)
      VALUES (@id, @question, @subject, @level, @difficulty, @options, @answer, @explanation)
    `)
    seedExercises.forEach((r) => stmt.run({ ...r, options: JSON.stringify(r.options) }))
    console.log(`🧠 Seeded ${seedExercises.length} exercises`)
  }
}

// Allow running directly: `npm run seed`
if (import.meta.url === `file://${process.argv[1]}`) {
  seedIfEmpty()
  console.log('✅ Seed complete.')
  process.exit(0)
}
