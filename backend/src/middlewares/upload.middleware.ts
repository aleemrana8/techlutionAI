import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? (process.env.VERCEL ? '/tmp/uploads' : './uploads')

// Ensure directory exists (use /tmp on Vercel serverless)
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
} catch {
  // Serverless read-only filesystem — skip
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = [
    // Images
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    // Videos
    'video/mp4', 'video/webm', 'video/quicktime',
    // Archives
    'application/zip', 'application/x-rar-compressed',
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`))
  }
}

const MAX_SIZE = (Number(process.env.MAX_FILE_SIZE_MB ?? 25)) * 1024 * 1024

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } })
