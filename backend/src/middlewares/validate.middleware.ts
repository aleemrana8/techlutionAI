import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { sendError } from '../utils/response'

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      sendError(res, 'Validation failed', 422, errors)
      return
    }
    req[source] = result.data as typeof req[typeof source]
    next()
  }
}
