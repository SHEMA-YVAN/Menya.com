import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { seedIfEmpty } from './seed.js'
import { login, register } from './auth.js'
import { notifyAdmins } from './notify.js'
import usersRouter from './routes/users.js'
import notificationsRouter from './routes/notifications.js'
import { UPLOAD_ROOT } from './upload.js'
import booksRouter from './routes/books.js'
import papersRouter from './routes/papers.js'
import exercisesRouter from './routes/exercises.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4000

// The built Vue app lives in /menya/dist (one level up from /server)
const CLIENT_DIST = path.join(__dirname, '..', '..', 'dist')

// Seed DB + ensure admin on boot
seedIfEmpty()

const app = express()

// CORS — in single-service mode the frontend is same-origin so CORS is moot,
// but we keep it permissive/configurable for local split-dev (Vite on :5173).
const corsEnv = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4173'
const origins = corsEnv.split(',').map((s) => s.trim())
app.use(cors({ origin: corsEnv === '*' ? true : origins }))
app.use(express.json({ limit: '2mb' }))

// Serve uploaded files (PDFs, covers)
app.use('/uploads', express.static(UPLOAD_ROOT))

/* --------------------------------------------------------------- API routes */
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
)

app.post('/api/auth/login', (req, res) => {
  // accept "username" or "identifier" (email or username)
  const { username, identifier, password } = req.body || {}
  const result = login(identifier || username, password)
  if (!result) return res.status(401).json({ error: 'Invalid credentials.' })
  res.json(result)
})

app.post('/api/auth/register', (req, res) => {
  const result = register(req.body || {})
  if (result.error) return res.status(400).json(result)
  // Notify admins of the new sign-up
  notifyAdmins({
    type: 'new_user',
    title: 'New user signed up',
    body: `${result.user.name} (${result.user.email}) just joined MENYA.`,
    link: '/admin',
  })
  res.status(201).json(result)
})

app.use('/api/users', usersRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/books', booksRouter)
app.use('/api/papers', papersRouter)
app.use('/api/exercises', exercisesRouter)

// API error handler (multer / validation)
app.use('/api', (err, req, res, next) => {
  if (err) {
    console.error(err.message)
    return res.status(400).json({ error: err.message || 'Request failed.' })
  }
  next()
})

/* ----------------------------------------------- Serve the built Vue client */
// When `dist/` exists (production / after `npm run build`), this single server
// hosts BOTH the website and the API on the same origin. No second server,
// no CORS, no separate deploy.
const hasClient = fs.existsSync(path.join(CLIENT_DIST, 'index.html'))
if (hasClient) {
  app.use(express.static(CLIENT_DIST))
  // SPA fallback: any non-API, non-upload route returns index.html so that
  // deep links like /admin or /books work on refresh.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.sendFile(path.join(CLIENT_DIST, 'index.html'))
  })
}

const server = app.listen(PORT, () => {
  console.log(`\n🚀 MENYA running at http://localhost:${PORT}`)
  if (hasClient) {
    console.log(`   Website + API are served together on this one URL.`)
    console.log(`   Admin portal: http://localhost:${PORT}/admin`)
  } else {
    console.log(`   API only (no dist/ found). Run the frontend with "npm run dev",`)
    console.log(`   or build it with "npm run build" to serve everything from here.`)
  }
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
})

// Friendly, non-crashing handling when the port is already taken.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n⚠️  Port ${PORT} is already in use — another MENYA server is probably still running.\n` +
        `   Fix it with ONE of these, then start again:\n` +
        `     • npm run kill-ports        (recommended — frees 4000 & 5173)\n` +
        `     • Windows:  npx kill-port ${PORT}\n` +
        `     • Or just close the other terminal running MENYA.\n`
    )
    process.exit(1)
  }
  throw err
})

// Release the port cleanly on shutdown (Ctrl+C / nodemon restart),
// so you don't leave an orphan process holding the port.
function shutdown() {
  server.close(() => process.exit(0))
  // Force-exit if it doesn't close quickly
  setTimeout(() => process.exit(0), 1500)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
