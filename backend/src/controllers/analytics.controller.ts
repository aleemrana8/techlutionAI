import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'

// ─── Overview ─────────────────────────────────────────────────────────────────

export async function overview(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalVisitors, todayVisitors, weekVisitors,
      totalLeads, newLeads, convertedLeads,
      totalClients, activeClients,
      totalEmployees, activeEmployees,
      totalProjects,
      totalIncome, totalExpenses,
    ] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.visitor.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count({ where: { status: 'CLOSED' } }),
      prisma.client.count(),
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count(),
      prisma.finance.aggregate({ where: { type: 'INCOME' }, _sum: { amount: true } }),
      prisma.finance.aggregate({ where: { type: 'EXPENSE' }, _sum: { amount: true } }),
    ])

    const income = totalIncome._sum.amount ?? 0
    const expenses = totalExpenses._sum.amount ?? 0
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

    sendSuccess(res, {
      visitors: { total: totalVisitors, today: todayVisitors, thisWeek: weekVisitors },
      leads: { total: totalLeads, new: newLeads, converted: convertedLeads, conversionRate },
      clients: { total: totalClients, active: activeClients },
      employees: { total: totalEmployees, active: activeEmployees },
      projects: { total: totalProjects },
      finance: { income, expenses, profit: income - expenses },
    })
  } catch (err) { next(err) }
}

// ─── Lead Analytics ───────────────────────────────────────────────────────────

export async function leadAnalytics(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const leads = await prisma.lead.findMany({
      select: { status: true, createdAt: true, service: true },
      orderBy: { createdAt: 'asc' },
    })

    // Status breakdown
    const statusBreakdown: Record<string, number> = {}
    leads.forEach(l => { statusBreakdown[l.status] = (statusBreakdown[l.status] || 0) + 1 })

    // Daily trend (last 30 days)
    const dailyTrend = buildDailyTrend(leads.map(l => l.createdAt), 30)

    // Service breakdown
    const serviceBreakdown: Record<string, number> = {}
    leads.forEach(l => {
      const svc = l.service || 'Other'
      serviceBreakdown[svc] = (serviceBreakdown[svc] || 0) + 1
    })

    sendSuccess(res, {
      total: leads.length,
      statusBreakdown,
      dailyTrend,
      serviceBreakdown,
    })
  } catch (err) { next(err) }
}

// ─── Visitor Analytics ────────────────────────────────────────────────────────

export async function visitorAnalytics(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const visitors = await prisma.visitor.findMany({
      select: { device: true, browser: true, os: true, page: true, country: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const deviceBreakdown: Record<string, number> = {}
    const pageBreakdown: Record<string, number> = {}
    const countryBreakdown: Record<string, number> = {}
    const browserBreakdown: Record<string, number> = {}

    visitors.forEach(v => {
      deviceBreakdown[v.device] = (deviceBreakdown[v.device] || 0) + 1
      if (v.page) pageBreakdown[v.page] = (pageBreakdown[v.page] || 0) + 1
      if (v.country) countryBreakdown[v.country] = (countryBreakdown[v.country] || 0) + 1
      if (v.browser) browserBreakdown[v.browser] = (browserBreakdown[v.browser] || 0) + 1
    })

    const dailyTrend = buildDailyTrend(visitors.map(v => v.createdAt), 30)

    sendSuccess(res, {
      total: visitors.length,
      deviceBreakdown,
      pageBreakdown,
      countryBreakdown,
      browserBreakdown,
      dailyTrend,
    })
  } catch (err) { next(err) }
}

// ─── Finance Analytics ────────────────────────────────────────────────────────

export async function financeAnalytics(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const records = await prisma.finance.findMany({
      select: { type: true, amount: true, category: true, date: true },
      orderBy: { date: 'asc' },
    })

    // Monthly revenue vs expenses
    const monthlyMap: Record<string, { income: number; expenses: number }> = {}
    records.forEach(r => {
      const key = r.date.toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expenses: 0 }
      if (r.type === 'INCOME') monthlyMap[key].income += r.amount
      else monthlyMap[key].expenses += r.amount
    })
    const monthlyTrend = Object.entries(monthlyMap).map(([month, vals]) => ({
      month,
      ...vals,
      profit: vals.income - vals.expenses,
    }))

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    records.forEach(r => {
      const cat = r.category || 'Other'
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + r.amount
    })

    const totalIncome = records.filter(r => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0)
    const totalExpenses = records.filter(r => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0)

    sendSuccess(res, {
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      monthlyTrend,
      categoryBreakdown,
    })
  } catch (err) { next(err) }
}

// ─── Project Analytics ────────────────────────────────────────────────────────

export async function projectAnalytics(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const projects = await prisma.project.findMany({
      select: { status: true, category: true, createdAt: true },
    })

    const statusBreakdown: Record<string, number> = {}
    const categoryBreakdown: Record<string, number> = {}
    projects.forEach(p => {
      statusBreakdown[p.status] = (statusBreakdown[p.status] || 0) + 1
      categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1
    })

    sendSuccess(res, { total: projects.length, statusBreakdown, categoryBreakdown })
  } catch (err) { next(err) }
}

// ─── HR Analytics ─────────────────────────────────────────────────────────────

export async function hrAnalytics(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const employees = await prisma.employee.findMany({
      select: { status: true, department: true, workload: true, salary: true, joinDate: true },
    })

    const departmentBreakdown: Record<string, number> = {}
    const statusBreakdown: Record<string, number> = {}
    let totalSalary = 0

    employees.forEach(e => {
      departmentBreakdown[e.department] = (departmentBreakdown[e.department] || 0) + 1
      statusBreakdown[e.status] = (statusBreakdown[e.status] || 0) + 1
      if (e.salary) totalSalary += e.salary
    })

    const workloadDistribution = {
      low: employees.filter(e => e.workload <= 33).length,
      medium: employees.filter(e => e.workload > 33 && e.workload <= 66).length,
      high: employees.filter(e => e.workload > 66).length,
    }

    sendSuccess(res, {
      total: employees.length,
      departmentBreakdown,
      statusBreakdown,
      workloadDistribution,
      avgSalary: employees.length > 0 ? Math.round(totalSalary / employees.length) : 0,
    })
  } catch (err) { next(err) }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDailyTrend(dates: Date[], days: number) {
  const now = new Date()
  const labels: string[] = []
  const values: number[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    labels.push(d.toLocaleDateString('en', { month: 'short', day: 'numeric' }))
    values.push(dates.filter(dt => dt.toISOString().slice(0, 10) === key).length)
  }

  return { labels, values }
}
