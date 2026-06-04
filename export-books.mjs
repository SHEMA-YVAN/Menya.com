#!/usr/bin/env node
/**
 * Export books from local data.db and output as JavaScript code
 * that can be pasted into server/src/seedData.js
 */

import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'server', 'data.db')

const SQL = await initSqlJs()

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ No database found at ${DB_PATH}`)
  process.exit(1)
}

const sqldb = new SQL.Database(fs.readFileSync(DB_PATH))
const stmt = sqldb.prepare('SELECT * FROM books ORDER BY created_at DESC')
const books = []
while (stmt.step()) {
  books.push(stmt.getAsObject())
}
stmt.free()

if (books.length === 0) {
  console.log('No books in database.')
  process.exit(0)
}

console.log(`Found ${books.length} books. Exporting as seed data format:\n`)
console.log('// Add these entries to server/src/seedData.js seedBooks array:')
console.log('// ------')

const exported = books.map(book => {
  // Format for seedData.js (without file paths, only metadata)
  return {
    id: book.id || `b${Math.random().toString(36).substr(2, 9)}`,
    title: book.title || 'Untitled',
    subject: book.subject || 'General',
    level: book.level || 'P1',
    author: book.author || 'REB',
    year: book.year || new Date().getFullYear(),
    pages: book.pages || 0,
    lang: book.lang || 'English',
    cover: book.cover || 1,
    downloads: book.downloads || 0,
    rating: book.rating || 4.5,
  }
})

exported.forEach(b => {
  console.log(`  ${JSON.stringify(b)},`)
})

console.log('// ------\n')
console.log(`✅ Copy the entries above and add them to seedBooks in server/src/seedData.js`)
console.log(`   Then run: git add -A && git commit -m "Add admin books to seed data" && git push\n`)

sqldb.close()
