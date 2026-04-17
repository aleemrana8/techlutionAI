import { z } from 'zod'

export const contactSchema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  phone:   z.string().max(30).optional(),
  company: z.string().max(100).optional(),
  service: z.string().max(100).optional(),
  message: z.string().min(10).max(2000),
})

export const projectSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email().optional().or(z.literal('')),
  phone:    z.string().max(30).optional(),
  service:  z.string().min(1).max(100),
  budget:   z.string().max(50).optional(),
  timeline: z.string().max(50).optional(),
  message:  z.string().min(10).max(2000),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ProjectInput = z.infer<typeof projectSchema>
