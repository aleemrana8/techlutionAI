import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import * as contactService from '../services/contact.service'
import { sendSuccess } from '../utils/response'
import { LeadStatus } from '@prisma/client'

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  try {
    const files = (req.files as Express.Multer.File[]) || []
    const lead = await contactService.submitContact({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      attachments: files,
    })
    sendSuccess(res, { id: lead.id }, 'Message received! We will contact you shortly.', 201)
  } catch (err) { next(err) }
}

export async function submitProjectRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const files = (req.files as Express.Multer.File[]) || []
    const lead = await contactService.submitProjectRequest({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      attachments: files,
    })
    sendSuccess(res, { id: lead.id }, 'Project request received! Our team will contact you within 24 hours.', 201)
  } catch (err) { next(err) }
}

export async function listLeads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await contactService.listLeads(req.query as Record<string, string>)
    sendSuccess(res, result.leads, 'Leads retrieved', 200, result.meta)
  } catch (err) { next(err) }
}

export async function updateLeadStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const lead = await contactService.updateLeadStatus(req.params.id, req.body.status as LeadStatus)
    sendSuccess(res, lead, 'Lead status updated')
  } catch (err) { next(err) }
}
