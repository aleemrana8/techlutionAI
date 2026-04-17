import { Router } from 'express'
import * as uploadCtrl from '../controllers/upload.controller'
import { upload } from '../middlewares/upload.middleware'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Upload a single file (authenticated)
router.post('/', authenticate, upload.single('file'), uploadCtrl.uploadFile)

// Upload multiple files (authenticated)
router.post('/multiple', authenticate, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded' })
      return
    }

    const prisma = (await import('../config/database')).default
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const { entityType, entityId, projectId } = req.body

    const files = await Promise.all(
      req.files.map((file) =>
        prisma.file.create({
          data: {
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: `${baseUrl}/uploads/${file.filename}`,
            storagePath: file.path,
            entityType: entityType ?? null,
            entityId: entityId ?? null,
            projectId: projectId ?? null,
          },
        }),
      ),
    )

    res.status(201).json({ success: true, message: 'Files uploaded successfully', data: files })
  } catch (err) {
    next(err)
  }
})

// List files (authenticated)
router.get('/', authenticate, uploadCtrl.getFiles)

export default router
