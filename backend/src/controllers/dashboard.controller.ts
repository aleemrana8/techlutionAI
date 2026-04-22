import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess } from '../utils/response'

export async function overview(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalVisitors,
      todayVisitors,
      pendingInquiries,
      respondedInquiries,
      ignoredInquiries,
      totalInquiries,
      totalClients,
      activeClients,
      totalEmployees,
      activeEmployees,
      totalProjects,
      activeProjects,
      totalProposals,
      newProposals,
      receivedIncomeAgg,
      expenseAgg,
      recentInquiries,
      recentVisitors,
    ] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ where: { createdAt: { gte: today } } }),
      prisma.lead.count({ where: { type: 'INQUIRY', status: 'NEW' } }),
      prisma.lead.count({ where: { type: 'INQUIRY', status: 'RESPONDED' } }),
      prisma.lead.count({ where: { type: 'INQUIRY', status: 'IGNORED' } }),
      prisma.lead.count({ where: { type: 'INQUIRY' } }),
      prisma.client.count(),
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.lead.count({ where: { type: 'PROPOSAL' } }),
      prisma.lead.count({ where: { type: 'PROPOSAL', status: 'NEW' } }),
      prisma.finance.aggregate({ where: { type: 'INCOME', received: true }, _sum: { amount: true } }),
      prisma.finance.aggregate({ where: { type: 'EXPENSE' }, _sum: { amount: true } }),
      prisma.lead.findMany({ where: { type: 'INQUIRY', status: 'NEW' }, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, service: true, status: true, createdAt: true } }),
      prisma.visitor.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, ipAddress: true, device: true, browser: true, page: true, country: true, createdAt: true } }),
    ])

    const totalRevenue = receivedIncomeAgg._sum.amount || 0
    const totalExpenses = expenseAgg._sum.amount || 0
    const profit = totalRevenue - totalExpenses

    sendSuccess(res, {
      visitors: { total: totalVisitors, today: todayVisitors },
      inquiries: { total: totalInquiries, pending: pendingInquiries, responded: respondedInquiries, ignored: ignoredInquiries },
      clients: { total: totalClients, active: activeClients },
      employees: { total: totalEmployees, active: activeEmployees },
      projects: { total: totalProjects, active: activeProjects },
      proposals: { total: totalProposals, new: newProposals },
      finance: {
        totalRevenue,
        totalExpenses,
        profit,
      },
      recentInquiries,
      recentVisitors,
    })
  } catch (err) { next(err) }
}
