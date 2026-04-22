import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { getPagination, buildPaginationMeta } from '../types'
import { emitDashboardEvent } from '../config/socket'
import { logActivity } from '../services/activity.service'

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { type, amount, description, category, projectRef, date, received } = req.body
    if (!type || amount === undefined || !description) {
      sendError(res, 'Type, amount, and description are required')
      return
    }
    if (!['INCOME', 'EXPENSE'].includes(type)) {
      sendError(res, 'Type must be INCOME or EXPENSE')
      return
    }
    const record = await prisma.finance.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        category,
        projectRef,
        received: received !== undefined ? !!received : true,
        date: date ? new Date(date) : new Date(),
      },
    })
    emitDashboardEvent('finance:new', record)
    logActivity({ action: 'FINANCE_CREATED', entity: 'Finance', entityId: record.id, details: `${type}: $${amount}`, adminUserId: req.admin?.id, ipAddress: req.ip })
    sendSuccess(res, record, 'Finance record created', 201)
  } catch (err) { next(err) }
}

export async function list(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = getPagination(req.query as any)
    const { type, category, startDate, endDate } = req.query as Record<string, string>

    const where: any = {}
    if (type) where.type = type
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [records, total] = await Promise.all([
      prisma.finance.findMany({ where, skip, take, orderBy: { date: 'desc' } }),
      prisma.finance.count({ where }),
    ])

    sendSuccess(res, records, 'Finance records retrieved', 200, buildPaginationMeta(total, page, limit))
  } catch (err) { next(err) }
}

export async function getById(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const record = await prisma.finance.findUnique({ where: { id: req.params.id } })
    if (!record) { sendError(res, 'Record not found', 404); return }
    sendSuccess(res, record)
  } catch (err) { next(err) }
}

export async function update(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { type, amount, description, category, projectRef, date, received } = req.body
    const record = await prisma.finance.update({
      where: { id: req.params.id },
      data: {
        ...(type && { type }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(category !== undefined && { category }),
        ...(projectRef !== undefined && { projectRef }),
        ...(received !== undefined && { received: !!received }),
        ...(date && { date: new Date(date) }),
      },
    })
    sendSuccess(res, record, 'Finance record updated')
  } catch (err) { next(err) }
}

export async function remove(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    await prisma.finance.delete({ where: { id: req.params.id } })
    sendSuccess(res, null, 'Finance record deleted')
  } catch (err) { next(err) }
}

export async function summary(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate } = req.query as Record<string, string>

    const where: any = {}
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [incomeAgg, expenseAgg, total, recentRecords, pendingIncomeAgg] = await Promise.all([
      prisma.finance.aggregate({ where: { ...where, type: 'INCOME', received: true }, _sum: { amount: true }, _count: true }),
      prisma.finance.aggregate({ where: { ...where, type: 'EXPENSE' }, _sum: { amount: true }, _count: true }),
      prisma.finance.count({ where }),
      prisma.finance.findMany({ where, take: 10, orderBy: { date: 'desc' } }),
      prisma.finance.aggregate({ where: { ...where, type: 'INCOME', received: false }, _sum: { amount: true }, _count: true }),
    ])

    const totalIncome = incomeAgg._sum.amount || 0
    const totalExpenses = expenseAgg._sum.amount || 0
    const pendingIncome = pendingIncomeAgg._sum.amount || 0

    sendSuccess(res, {
      totalIncome,
      totalExpenses,
      pendingIncome,
      profit: totalIncome - totalExpenses,
      totalRecords: total,
      incomeCount: incomeAgg._count,
      expenseCount: expenseAgg._count,
      pendingCount: pendingIncomeAgg._count,
      recentTransactions: recentRecords,
    })
  } catch (err) { next(err) }
}
