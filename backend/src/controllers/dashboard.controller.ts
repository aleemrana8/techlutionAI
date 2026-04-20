import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess } from '../utils/response'

export async function overview(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      totalVisitors,
      todayVisitors,
      totalLeads,
      newLeads,
      totalClients,
      activeClients,
      totalEmployees,
      activeEmployees,
      totalProjects,
      incomeAgg,
      expenseAgg,
      recentLeads,
      recentVisitors,
    ] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ where: { createdAt: { gte: today } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.client.count(),
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count(),
      prisma.finance.aggregate({ where: { type: 'INCOME', date: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.finance.aggregate({ where: { type: 'EXPENSE', date: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, service: true, status: true, createdAt: true } }),
      prisma.visitor.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, ipAddress: true, device: true, browser: true, page: true, country: true, createdAt: true } }),
    ])

    sendSuccess(res, {
      visitors: { total: totalVisitors, today: todayVisitors },
      leads: { total: totalLeads, new: newLeads },
      clients: { total: totalClients, active: activeClients },
      employees: { total: totalEmployees, active: activeEmployees },
      projects: { total: totalProjects },
      finance: {
        monthlyIncome: incomeAgg._sum.amount || 0,
        monthlyExpenses: expenseAgg._sum.amount || 0,
        monthlyProfit: (incomeAgg._sum.amount || 0) - (expenseAgg._sum.amount || 0),
      },
      recentLeads,
      recentVisitors,
    })
  } catch (err) { next(err) }
}
