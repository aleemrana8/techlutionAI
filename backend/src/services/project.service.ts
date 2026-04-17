import * as projectRepo from '../repositories/project.repository'
import { generateProjectContent } from './ai.service'
import { sendMail, newProjectEmailAdmin } from './email.service'
import { slugify } from '../utils/jwt'
import { delCache, getCache, setCache } from '../config/redis'
import { Prisma, ProjectCategory, ProjectStatus } from '@prisma/client'
import { getPagination, buildPaginationMeta } from '../types'

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base)
  const existing = await projectRepo.findProjectBySlug(slug)
  if (existing) slug = `${slug}-${Date.now()}`
  return slug
}

export async function createProject(input: {
  title: string
  shortDescription: string
  fullDescription: string
  category: ProjectCategory
  features: string[]
  workflowSteps: object[]
  benefits: string[]
  images?: string[]
  status?: ProjectStatus
  tags?: string[]
  techStack?: string[]
  durationWeeks?: number
  createdById: string
  createdByName: string
  createdByEmail: string
}) {
  const slug = await uniqueSlug(input.title)

  const project = await projectRepo.createProject({
    title: input.title,
    slug,
    shortDescription: input.shortDescription,
    fullDescription: input.fullDescription,
    category: input.category,
    features: input.features,
    workflowSteps: input.workflowSteps as Prisma.InputJsonValue[],
    benefits: input.benefits,
    images: input.images ?? [],
    status: input.status ?? 'DRAFT',
    tags: input.tags ?? [],
    techStack: input.techStack ?? [],
    durationWeeks: input.durationWeeks,
    createdBy: { connect: { id: input.createdById } },
  })

  // Notify admin via email (fire-and-forget)
  void sendMail({
    to: process.env.ADMIN_EMAIL!,
    subject: `[Techlution AI] New Project: ${project.title}`,
    html: newProjectEmailAdmin({
      title: project.title,
      category: project.category,
      shortDescription: project.shortDescription,
      createdBy: input.createdByName,
    }),
  })

  await delCache('projects:list')
  return project
}

export async function getProject(id: string) {
  const cacheKey = `project:${id}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const project = await projectRepo.findProjectById(id)
  if (!project) throw new Error('Project not found')

  await setCache(cacheKey, project, 300)
  return project
}

export async function getProjectBySlug(slug: string) {
  const cacheKey = `project:slug:${slug}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const project = await projectRepo.findProjectBySlug(slug)
  if (!project) throw new Error('Project not found')

  await setCache(cacheKey, project, 300)
  return project
}

export async function updateProject(id: string, data: Prisma.ProjectUpdateInput) {
  const project = await projectRepo.findProjectById(id)
  if (!project) throw new Error('Project not found')

  const updated = await projectRepo.updateProject(id, data)
  await delCache(`project:${id}`)
  await delCache(`project:slug:${project.slug}`)
  return updated
}

export async function deleteProject(id: string) {
  const project = await projectRepo.findProjectById(id)
  if (!project) throw new Error('Project not found')
  await projectRepo.deleteProject(id)
  await delCache(`project:${id}`)
}

export async function listProjects(query: {
  page?: string
  limit?: string
  search?: string
  category?: string
  status?: string
}) {
  const { skip, take, page, limit } = getPagination(query)
  const { projects, total } = await projectRepo.listProjects({
    skip, take,
    search: query.search,
    category: query.category as ProjectCategory | undefined,
    status: query.status as ProjectStatus | undefined,
  })
  return { projects, meta: buildPaginationMeta(total, page, limit) }
}

export async function generateProject(title: string, category: string) {
  return generateProjectContent({ title, category })
}
