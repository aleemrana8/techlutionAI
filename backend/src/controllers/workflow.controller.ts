import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import * as workflowService from '../services/workflow.service'
import { sendSuccess } from '../utils/response'

export async function createWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const wf = await workflowService.createWorkflow(req.body)
    sendSuccess(res, wf, 'Workflow created', 201)
  } catch (err) { next(err) }
}

export async function getWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const wf = await workflowService.getWorkflow(req.params.id)
    sendSuccess(res, wf)
  } catch (err) { next(err) }
}

export async function listWorkflows(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await workflowService.listWorkflows(req.query as Record<string, string>)
    sendSuccess(res, result.workflows, 'Workflows retrieved', 200, result.meta)
  } catch (err) { next(err) }
}

export async function updateWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const wf = await workflowService.updateWorkflow(req.params.id, req.body)
    sendSuccess(res, wf, 'Workflow updated')
  } catch (err) { next(err) }
}

export async function triggerWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await workflowService.triggerWorkflow(req.params.id, req.body, req.user?.id)
    sendSuccess(res, result, 'Workflow triggered')
  } catch (err) { next(err) }
}

export async function handleWebhook(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await workflowService.handleWebhook(req.params.id, req.body)
    sendSuccess(res, result, 'Webhook processed')
  } catch (err) { next(err) }
}
