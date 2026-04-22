import { Response, NextFunction } from 'express'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import * as pfService from '../services/projectFinance.service'

// ─── Calculate / Recalculate Sharing ─────────────────────────────────────────

export async function calculate(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const {
      projectRef, totalAmount, currency, fiverrFeePercent, zakatEnabled,
      zakatPercent, otherCosts, founderIncluded, teamMemberIds,
    } = req.body

    if (!projectRef || totalAmount === undefined || !Array.isArray(teamMemberIds)) {
      sendError(res, 'projectRef, totalAmount, and teamMemberIds[] are required')
      return
    }

    const result = await pfService.calculateSharing({
      projectRef,
      totalAmount: parseFloat(totalAmount),
      currency,
      fiverrFeePercent: fiverrFeePercent != null ? parseFloat(fiverrFeePercent) : undefined,
      zakatEnabled,
      zakatPercent: zakatPercent != null ? parseFloat(zakatPercent) : undefined,
      otherCosts,
      founderIncluded,
      teamMemberIds,
      adminUserId: req.admin?.id,
    })

    sendSuccess(res, result, 'Cost sharing calculated', 200)
  } catch (err) { next(err) }
}

// ─── Get Project Finance ─────────────────────────────────────────────────────

export async function getFinance(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const finance = await pfService.getProjectFinance(req.params.projectRef)
    if (!finance) { sendError(res, 'No finance record found', 404); return }
    sendSuccess(res, finance)
  } catch (err) { next(err) }
}

// ─── Get Project Assignments ─────────────────────────────────────────────────

export async function getAssignments(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const assignments = await pfService.getAssignments(req.params.projectRef)
    sendSuccess(res, assignments)
  } catch (err) { next(err) }
}

// ─── Send Share Notifications ────────────────────────────────────────────────

export async function notifyTeam(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { projectRef, projectTitle, type } = req.body
    if (!projectRef || !projectTitle || !type) {
      sendError(res, 'projectRef, projectTitle, and type (assignment|update|completion) are required')
      return
    }
    await pfService.notifyShareholders(projectRef, projectTitle, type)
    sendSuccess(res, null, 'Notifications sent')
  } catch (err) { next(err) }
}

// ─── Mark Share Paid ─────────────────────────────────────────────────────────

export async function markPaid(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const share = await pfService.markSharePaid(req.params.shareId)
    sendSuccess(res, share, 'Share marked as paid')
  } catch (err) { next(err) }
}
