import prisma from '../config/database'
import { Prisma, ProjectCategory, ProjectStatus } from '@prisma/client'

export async function createProject(data: Prisma.ProjectCreateInput) {
  return prisma.project.create({ data, include: { createdBy: { select: { id: true, name: true, email: true } }, files: true } })
}

export async function findProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { createdBy: { select: { id: true, name: true, email: true } }, files: true },
  })
}

export async function findProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: { createdBy: { select: { id: true, name: true, email: true } }, files: true },
  })
}

export async function updateProject(id: string, data: Prisma.ProjectUpdateInput) {
  return prisma.project.update({ where: { id }, data, include: { createdBy: { select: { id: true, name: true, email: true } }, files: true } })
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } })
}

export async function listProjects(params: {
  skip: number
  take: number
  search?: string
  category?: ProjectCategory
  status?: ProjectStatus
}) {
  const { skip, take, search, category, status } = params
  const where: Prisma.ProjectWhereInput = {
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { shortDescription: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true, email: true } }, files: true },
    }),
    prisma.project.count({ where }),
  ])
  return { projects, total }
}
