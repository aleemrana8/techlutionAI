import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'
import { sendError } from '../utils/response'

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode)
    return
  }

  if (err instanceof Error) {
    logger.error(`Unhandled error on ${req.method} ${req.path}:`, err)

    // Known operational errors (Prisma, JWT, etc.)
    if (err.message.includes('not found'))         { sendError(res, err.message, 404); return }
    if (err.message.includes('already registered')){ sendError(res, err.message, 409); return }
    if (err.message.includes('Invalid credentials')){ sendError(res, err.message, 401); return }
    if (err.message.includes('Invalid') && err.message.includes('token')){ sendError(res, err.message, 401); return }
  }

  sendError(res, 'Internal server error', 500)
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404)
}
