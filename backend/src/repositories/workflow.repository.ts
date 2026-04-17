import prisma from '../config/database'
import { Prisma, WorkflowStatus } from '@prisma/client'

export async function createWorkflow(data: Prisma.WorkflowCreateInput) {
  return prisma.workflow.create({ data })
}

export async function findWorkflowById(id: string) {
  return prisma.workflow.findUnique({ where: { id }, include: { logs: { orderBy: { createdAt: 'desc' }, take: 20 } } })
}

export async function listWorkflows(skip: number, take: number, status?: WorkflowStatus) {
  const where: Prisma.WorkflowWhereInput = status ? { status } : {}
  const [workflows, total] = await prisma.$transaction([
    prisma.workflow.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.workflow.count({ where }),
  ])
  return { workflows, total }
}

export async function updateWorkflow(id: string, data: Prisma.WorkflowUpdateInput) {
  return prisma.workflow.update({ where: { id }, data })
}

export async function logWorkflowRun(data: Prisma.WorkflowLogCreateInput) {
  return prisma.workflowLog.create({ data })
}

export async function incrementRunCount(id: string) {
  return prisma.workflow.update({ where: { id }, data: { runCount: { increment: 1 }, lastRunAt: new Date() } })
}
