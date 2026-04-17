import { z } from 'zod'

export const registerSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  role:     z.enum(['ADMIN', 'CLIENT', 'STAFF']).optional(),
})

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, 'Password required'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput    = z.infer<typeof loginSchema>
