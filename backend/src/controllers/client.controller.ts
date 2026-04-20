import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { getPagination, buildPaginationMeta } from '../types'
import { emitDashboardEvent } from '../config/socket'
import { logActivity } from '../services/activity.service'

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, company, industry, status, notes } = req.body
    if (!name || !email) {
      sendError(res, 'Name and email are required')
      return
    }
    const client = await prisma.client.create({
      data: { name, email, phone, company, industry, status, notes },
    })
    emitDashboardEvent('client:new', client)
    logActivity({ action: 'CLIENT_CREATED', entity: 'Client', entityId: client.id, details: `Client: ${name}`, adminUserId: req.admin?.id, ipAddress: req.ip })
    sendSuccess(res, client, 'Client created', 201)
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
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.client.count({ where }),
    ])

    sendSuccess(res, clients, 'Clients retrieved', 200, buildPaginationMeta(total, page, limit))
  } catch (err) { next(err) }
}

export async function getById(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const client = await prisma.client.findUnique({ where: { id: req.params.id } })
    if (!client) { sendError(res, 'Client not found', 404); return }
    sendSuccess(res, client)
  } catch (err) { next(err) }
}

export async function update(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, company, industry, status, notes, projects, revenue } = req.body
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(industry !== undefined && { industry }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(projects !== undefined && { projects }),
        ...(revenue !== undefined && { revenue }),
      },
    })
    sendSuccess(res, client, 'Client updated')
  } catch (err) { next(err) }
}

export async function remove(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    await prisma.client.delete({ where: { id: req.params.id } })
    sendSuccess(res, null, 'Client deleted')
  } catch (err) { next(err) }
}

export async function stats(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const [total, statusCounts, revenueAgg] = await Promise.all([
      prisma.client.count(),
      prisma.client.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.client.aggregate({ _sum: { revenue: true } }),
    ])

    sendSuccess(res, {
      total,
      totalRevenue: revenueAgg._sum.revenue || 0,
      byStatus: statusCounts.reduce((acc: any, s) => {
        acc[s.status] = s._count.status
        return acc
      }, {}),
    })
  } catch (err) { next(err) }
}
