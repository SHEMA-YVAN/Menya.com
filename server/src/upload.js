import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// UPLOAD_ROOT can be overridden via env (e.g. a mounted persistent disk in prod).
export const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', 'uploads')

// Ensure folders exist
for (const sub of ['books', 'papers']) {
  fs.mkdirSync(path.join(UPLOAD_ROOT, sub), { recursive: true })
}

function makeStorage(folder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, folder)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
      cb(null, safe)
    },
  })
}

const imageTypes = ['.jpg', '.jpeg', '.png', '.webp']
const docTypes = ['.pdf']

function fileFilter(allowed) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error(`Unsupported file type: ${ext}`))
  }
}

// Books accept a cover image + a pdf
export const uploadBook = multer({
  storage: makeStorage('books'),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (file.fieldname === 'cover' && imageTypes.includes(ext)) return cb(null, true)
    if (file.fieldname === 'pdf' && docTypes.includes(ext)) return cb(null, true)
    cb(new Error(`Unsupported file for ${file.fieldname}: ${ext}`))
  },
}).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
])

// Papers accept a pdf only
export const uploadPaper = multer({
  storage: makeStorage('papers'),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: fileFilter(docTypes),
}).single('pdf')
