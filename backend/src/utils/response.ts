import { Response } from 'express'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  meta?: Record<string, unknown>
  errors?: unknown
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Record<string, unknown>,
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  } satisfies ApiResponse<T>)
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown,
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  } satisfies ApiResponse)
}
