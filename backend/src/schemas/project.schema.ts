import { z } from 'zod'

const workflowStep = z.object({
  step:        z.number().int().positive(),
  title:       z.string().min(1),
  description: z.string().min(1),
})

export const createProjectSchema = z.object({
  title:            z.string().min(3).max(200),
  shortDescription: z.string().min(10).max(500),
  fullDescription:  z.string().min(20),
  category:         z.enum(['HEALTHCARE','AI_ML','AUTOMATION','COMPUTER_VISION','DEVOPS_CLOUD','DATA_PIPELINES','WEB_BACKEND','OTHER']),
  features:         z.array(z.string().min(1)).min(1).max(20),
  workflowSteps:    z.array(workflowStep).min(1),
  benefits:         z.array(z.string().min(1)).min(1).max(20),
  images:           z.array(z.string().url()).optional(),
  status:           z.enum(['DRAFT','ACTIVE','COMPLETED','ARCHIVED']).optional(),
  tags:             z.array(z.string()).optional(),
  techStack:        z.array(z.string()).optional(),
  durationWeeks:    z.number().int().positive().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export const generateProjectSchema = z.object({
  title:    z.string().min(3).max(200),
  category: z.string().min(1),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
