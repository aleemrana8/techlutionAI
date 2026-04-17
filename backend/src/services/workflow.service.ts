import * as wfRepo from '../repositories/workflow.repository'
import { getPagination, buildPaginationMeta } from '../types'
import { Prisma, WorkflowStatus } from '@prisma/client'
import logger from '../utils/logger'


export async function createWorkflow(data: Prisma.WorkflowCreateInput) {
  return wfRepo.createWorkflow(data)
}

export async function getWorkflow(id: string) {
  const wf = await wfRepo.findWorkflowById(id)
  if (!wf) throw new Error('Workflow not found')
  return wf
}

export async function listWorkflows(query: { page?: string; limit?: string; status?: string }) {
  const { skip, take, page, limit } = getPagination(query)
  const { workflows, total } = await wfRepo.listWorkflows(skip, take, query.status as WorkflowStatus | undefined)
  return { workflows, meta: buildPaginationMeta(total, page, limit) }
}

export async function updateWorkflow(id: string, data: Prisma.WorkflowUpdateInput) {
  const wf = await wfRepo.findWorkflowById(id)
  if (!wf) throw new Error('Workflow not found')
  return wfRepo.updateWorkflow(id, data)
}

export async function triggerWorkflow(id: string, payload: Record<string, unknown>, triggeredBy?: string) {
  const workflow = await wfRepo.findWorkflowById(id)
  if (!workflow || workflow.status !== 'ACTIVE') throw new Error('Workflow not found or inactive')

  const startedAt = Date.now()
  try {
    logger.info(`Triggering workflow ${id} (${workflow.name})`)

    // Simulate execution of each step (real impl would dispatch to n8n / webhook)
    const output: { step: unknown; status: string; type: unknown }[] = []
    for (const step of workflow.steps as Record<string, unknown>[]) {
      output.push({ step: step.order, status: 'executed', type: step.type })
    }

    await wfRepo.logWorkflowRun({
      workflow: { connect: { id } },
      status: 'SUCCESS',
      input: payload as unknown as Prisma.InputJsonValue,
      output: { steps: output } as unknown as Prisma.InputJsonValue,
      durationMs: Date.now() - startedAt,
      triggeredBy: triggeredBy ?? 'api',
    })

    await wfRepo.incrementRunCount(id)
    return { status: 'SUCCESS', steps: output }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await wfRepo.logWorkflowRun({
      workflow: { connect: { id } },
      status: 'FAILED',
      input: payload as unknown as Prisma.InputJsonValue,
      error: message,
      durationMs: Date.now() - startedAt,
      triggeredBy: triggeredBy ?? 'api',
    })
    throw err
  }
}

export async function handleWebhook(id: string, body: Record<string, unknown>) {
  return triggerWorkflow(id, body, 'webhook')
}
