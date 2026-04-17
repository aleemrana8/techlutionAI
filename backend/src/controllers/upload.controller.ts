import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import prisma from '../config/database'
import path from 'path'
import { sendSuccess, sendError } from '../utils/response'

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400)
      return
    }

    const { entityType, entityId, projectId } = req.body
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const url = `${baseUrl}/uploads/${req.file.filename}`

    const file = await prisma.file.create({
      data: {
        filename:     req.file.filename,
        originalName: req.file.originalname,
        mimeType:     req.file.mimetype,
        size:         req.file.size,
        url,
        storagePath:  req.file.path,
        entityType:   entityType ?? null,
        entityId:     entityId   ?? null,
        projectId:    projectId  ?? null,
      },
    })

    sendSuccess(res, file, 'File uploaded successfully', 201)
  } catch (err) { next(err) }
}

export async function getFiles(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { entityType, entityId, projectId } = req.query as Record<string, string>
    const files = await prisma.file.findMany({
      where: {
        ...(entityType ? { entityType } : {}),
        ...(entityId   ? { entityId }   : {}),
        ...(projectId  ? { projectId }  : {}),
      },
      orderBy: { uploadedAt: 'desc' },
    })
    sendSuccess(res, files)
  } catch (err) { next(err) }
}
