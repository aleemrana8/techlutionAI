import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { getPagination, buildPaginationMeta } from '../types'

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { ipAddress, device, browser, os, page, referrer, country, city, sessionId } = req.body
    const visitor = await prisma.visitor.create({
      data: { ipAddress, device, browser, os, page, referrer, country, city, sessionId },
    })
    sendSuccess(res, visitor, 'Visitor logged', 201)
  } catch (err) { next(err) }
}

export async function list(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = getPagination(req.query as any)
    const { device, startDate, endDate, pagePath } = req.query as Record<string, string>

    const where: any = {}
    if (device) where.device = device
    if (pagePath) where.page = { contains: pagePath, mode: 'insensitive' }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.visitor.count({ where }),
    ])

    sendSuccess(res, visitors, 'Visitors retrieved', 200, buildPaginationMeta(total, page, limit))
  } catch (err) { next(err) }
}

export async function stats(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [total, todayCount, weekCount, deviceStats] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ where: { createdAt: { gte: today } } }),
      prisma.visitor.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.visitor.groupBy({ by: ['device'], _count: { device: true } }),
    ])

    sendSuccess(res, {
      total,
      today: todayCount,
      thisWeek: weekCount,
      byDevice: deviceStats.map(d => ({ device: d.device, count: d._count.device })),
    })
  } catch (err) { next(err) }
}
