import prisma from '../config/database'
import { Prisma, LeadStatus } from '@prisma/client'

export async function createLead(data: Prisma.LeadCreateInput) {
  return prisma.lead.create({ data })
}

export async function listLeads(skip: number, take: number, status?: LeadStatus) {
  const where: Prisma.LeadWhereInput = status ? { status } : {}
  const [leads, total] = await prisma.$transaction([
    prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.lead.count({ where }),
  ])
  return { leads, total }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return prisma.lead.update({ where: { id }, data: { status } })
}
