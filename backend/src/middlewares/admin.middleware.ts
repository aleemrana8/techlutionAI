import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { sendError } from '../utils/response'
import { hasPermission, type AdminRoleName, type RolePermissions } from '../config/permissions'

export interface AdminRequest extends Request {
  admin?: { id: string; role: AdminRoleName; username?: string }
}

/** Verifies JWT and ensures any admin role */
export function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authorization token required', 401)
    return
  }

  try {
    const payload = verifyAccessToken(authHeader.slice(7))
    const role = (payload.role || '').toUpperCase()
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'MANAGER', 'SUPPORT']
    if (!validRoles.includes(role)) {
      sendError(res, 'Admin access required', 403)
      return
    }
    req.admin = {
      id: payload.sub,
      role: role as AdminRoleName,
      username: payload.email,
    }
    next()
  } catch {
    sendError(res, 'Invalid or expired token', 401)
  }
}

/** Check permission for a specific resource + action */
export function requirePermission(
  resource: keyof RolePermissions,
  action?: 'read' | 'write',
) {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      sendError(res, 'Authorization required', 401)
      return
    }
    if (!hasPermission(req.admin.role, resource, action)) {
      sendError(res, 'Insufficient permissions', 403)
      return
    }
    next()
  }
}

/** Restrict to specific roles */
export function requireRoles(...roles: AdminRoleName[]) {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      sendError(res, 'Authorization required', 401)
      return
    }
    if (!roles.includes(req.admin.role)) {
      sendError(res, 'Insufficient role privileges', 403)
      return
    }
    next()
  }
}
