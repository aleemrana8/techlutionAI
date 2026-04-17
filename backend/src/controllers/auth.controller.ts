import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import * as authService from '../services/auth.service'
import { sendSuccess } from '../utils/response'

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body)
    sendSuccess(res, result, 'Registered successfully', 201)
  } catch (err) { next(err) }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body.email, req.body.password)
    sendSuccess(res, result, 'Login successful')
  } catch (err) { next(err) }
}

export async function refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.refresh(req.body.refreshToken)
    sendSuccess(res, result, 'Token refreshed')
  } catch (err) { next(err) }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.user!.id)
    sendSuccess(res, null, 'Logged out successfully')
  } catch (err) { next(err) }
}

export async function profile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.id)
    sendSuccess(res, user)
  } catch (err) { next(err) }
}
