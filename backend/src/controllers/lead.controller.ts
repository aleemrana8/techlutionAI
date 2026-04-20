import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { getPagination, buildPaginationMeta } from '../types'
import { sendMail } from '../services/email.service'
import { emitDashboardEvent } from '../config/socket'
import { logActivity } from '../services/activity.service'

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, service, message, status } = req.body
    if (!name || !message) {
      sendError(res, 'Name and message are required')
      return
    }
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || '',
        phone,
        service,
        message,
        status: status || 'NEW',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    })

    // Email notification to admin
    try {
      await sendMail({
        to: process.env.ADMIN_EMAIL || 'raleem811811@gmail.com',
        subject: `[Techlution AI] New Lead — ${service || 'General'} — ${name}`,
        html: `<h2>New Lead Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Service:</strong> ${service || 'N/A'}</p>
          <p><strong>Message:</strong> ${message}</p>`,
      })
    } catch { /* email is optional */ }

    emitDashboardEvent('lead:new', lead)
    logActivity({ action: 'LEAD_CREATED', entity: 'Lead', entityId: lead.id, details: `Lead: ${name}`, adminUserId: req.admin?.id, ipAddress: req.ip })

    sendSuccess(res, lead, 'Lead created', 201)
  } catch (err) { next(err) }
}

export async function list(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = getPagination(req.query as any)
    const { status, search } = req.query as Record<string, string>

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { service: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.lead.count({ where }),
    ])

    sendSuccess(res, leads, 'Leads retrieved', 200, buildPaginationMeta(total, page, limit))
  } catch (err) { next(err) }
}

export async function getById(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) { sendError(res, 'Lead not found', 404); return }
    sendSuccess(res, lead)
  } catch (err) { next(err) }
}

export async function update(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { status, service, message } = req.body
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(service && { service }),
        ...(message && { message }),
      },
    })
    sendSuccess(res, lead, 'Lead updated')
  } catch (err) { next(err) }
}

export async function remove(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } })
    sendSuccess(res, null, 'Lead deleted')
  } catch (err) { next(err) }
}

export async function stats(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const [total, statusCounts] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({ by: ['status'], _count: { status: true } }),
    ])

    sendSuccess(res, {
      total,
      byStatus: statusCounts.reduce((acc: any, s) => {
        acc[s.status] = s._count.status
        return acc
      }, {}),
    })
  } catch (err) { next(err) }
}
