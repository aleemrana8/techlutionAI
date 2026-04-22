import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { hashPassword, comparePassword } from '../utils/bcrypt'
import { signAccessToken } from '../utils/jwt'
import { logActivity } from '../services/activity.service'
import { ROLE_PERMISSIONS } from '../config/permissions'
import { emitDashboardEvent } from '../config/socket'

// ─── Admin Login (RBAC) ──────────────────────────────────────────────────────

export async function login(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      sendError(res, 'Username and password are required')
      return
    }

    const adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        isActive: true,
      },
    })

    if (!adminUser) {
      await logActivity({
        action: 'LOGIN_FAILED',
        details: `Failed login attempt for: ${username}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      sendError(res, 'Invalid credentials', 401)
      return
    }

    const valid = await comparePassword(password, adminUser.passwordHash)
    if (!valid) {
      await logActivity({
        action: 'LOGIN_FAILED',
        details: `Wrong password for: ${username}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        adminUserId: adminUser.id,
      })
      sendError(res, 'Invalid credentials', 401)
      return
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() },
    })

    const token = signAccessToken({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    })

    await logActivity({
      action: 'LOGIN_SUCCESS',
      details: `Admin login: ${adminUser.name} (${adminUser.role})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      adminUserId: adminUser.id,
    })

    sendSuccess(res, {
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      },
      permissions: ROLE_PERMISSIONS[adminUser.role],
    })
  } catch (err) { next(err) }
}

// ─── List Admin Users ─────────────────────────────────────────────────────────

export async function list(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true, username: true, email: true, name: true,
        role: true, isActive: true, lastLoginAt: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    sendSuccess(res, users)
  } catch (err) { next(err) }
}

// ─── Create Admin User ───────────────────────────────────────────────────────

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { username, email, password, name, role } = req.body
    if (!username || !email || !password || !name || !role) {
      sendError(res, 'All fields are required (username, email, password, name, role)')
      return
    }

    const validRoles = ['ADMIN', 'HR', 'FINANCE', 'MANAGER', 'SUPPORT']
    if (!validRoles.includes(role)) {
      sendError(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`)
      return
    }

    const existing = await prisma.adminUser.findFirst({
      where: { OR: [{ username }, { email }] },
    })
    if (existing) {
      sendError(res, 'Username or email already exists', 409)
      return
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.adminUser.create({
      data: { username, email, passwordHash, name, role },
      select: { id: true, username: true, email: true, name: true, role: true, createdAt: true },
    })

    await logActivity({
      action: 'ADMIN_USER_CREATED',
      entity: 'AdminUser',
      entityId: user.id,
      details: `Created admin user: ${user.name} (${user.role})`,
      adminUserId: req.admin?.id,
      ipAddress: req.ip,
    })

    sendSuccess(res, user, 'Admin user created', 201)
  } catch (err) { next(err) }
}

// ─── Update Admin User ───────────────────────────────────────────────────────

export async function update(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { name, email, role, isActive, password } = req.body

    const data: any = {}
    if (name) data.name = name
    if (email) data.email = email
    if (role) data.role = role
    if (typeof isActive === 'boolean') data.isActive = isActive
    if (password) data.passwordHash = await hashPassword(password)

    const user = await prisma.adminUser.update({
      where: { id },
      data,
      select: { id: true, username: true, email: true, name: true, role: true, isActive: true },
    })

    await logActivity({
      action: 'ADMIN_USER_UPDATED',
      entity: 'AdminUser',
      entityId: id,
      details: `Updated admin user: ${user.name}`,
      adminUserId: req.admin?.id,
      ipAddress: req.ip,
    })

    sendSuccess(res, user, 'Admin user updated')
  } catch (err) { next(err) }
}

// ─── Delete Admin User ───────────────────────────────────────────────────────

export async function remove(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    // Prevent self-deletion
    if (req.admin?.id === id) {
      sendError(res, 'Cannot delete your own account', 400)
      return
    }

    await prisma.adminUser.delete({ where: { id } })

    await logActivity({
      action: 'ADMIN_USER_DELETED',
      entity: 'AdminUser',
      entityId: id,
      details: `Deleted admin user`,
      adminUserId: req.admin?.id,
      ipAddress: req.ip,
    })

    sendSuccess(res, null, 'Admin user deleted')
  } catch (err) { next(err) }
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export async function getLogs(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, action, from, to } = req.query as Record<string, string>
    const { getActivityLogs } = await import('../services/activity.service')
    const result = await getActivityLogs({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      action,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })
    sendSuccess(res, result.logs, 'Activity logs', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

// ─── Dashboard Summary (combined KPIs) ───────────────────────────────────────

export async function dashboardSummary(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalVisitors, todayVisitors,
      totalLeads, newLeads, convertedLeads,
      totalClients, activeClients,
      totalEmployees, activeEmployees,
      totalProjects,
      income, expenses,
      recentLeads, recentVisitors,
      pendingTasks,
    ] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count({ where: { status: 'CLOSED' } }),
      prisma.client.count(),
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count(),
      prisma.finance.aggregate({ where: { type: 'INCOME', date: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.finance.aggregate({ where: { type: 'EXPENSE', date: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.visitor.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.employee.count({ where: { workload: { gt: 66 } } }),
    ])

    const totalIncome = income._sum.amount ?? 0
    const totalExpenses = expenses._sum.amount ?? 0
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

    sendSuccess(res, {
      visitors: { total: totalVisitors, today: todayVisitors },
      inquiries: { total: totalLeads, new: newLeads, converted: convertedLeads, conversionRate },
      clients: { total: totalClients, active: activeClients },
      employees: { total: totalEmployees, active: activeEmployees },
      projects: { total: totalProjects },
      finance: { income: totalIncome, expenses: totalExpenses, profit: totalIncome - totalExpenses },
      pendingTasks,
      conversionRate,
      recentInquiries: recentLeads,
      recentVisitors,
    })
  } catch (err) { next(err) }
}

/* ─── Dashboard Trends (last 7 months) ─────────────────────────────────────── */

export async function dashboardTrends(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date()
    const months: { name: string; start: Date; end: Date }[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      months.push({
        name: d.toLocaleString('en', { month: 'short' }),
        start: d,
        end,
      })
    }

    const trends = await Promise.all(
      months.map(async (m) => {
        const [visitors, inquiries] = await Promise.all([
          prisma.visitor.count({ where: { createdAt: { gte: m.start, lt: m.end } } }),
          prisma.lead.count({ where: { createdAt: { gte: m.start, lt: m.end } } }),
        ])
        return { name: m.name, visitors, inquiries }
      })
    )

    sendSuccess(res, trends)
  } catch (err) { next(err) }
}
