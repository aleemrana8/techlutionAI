import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { sendError } from '../utils/response'
import { AuthRequest } from '../types'
import { Role } from '@prisma/client'

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authorization token required', 401)
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role as Role }
    next()
  } catch {
    sendError(res, 'Invalid or expired token', 401)
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403)
      return
    }
    next()
  }
}
