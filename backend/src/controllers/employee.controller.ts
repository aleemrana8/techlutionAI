import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { getPagination, buildPaginationMeta } from '../types'
import { emitDashboardEvent } from '../config/socket'
import { logActivity } from '../services/activity.service'

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, role, department, status, workload, salary, joinDate, notes } = req.body
    if (!name || !email || !role || !department) {
      sendError(res, 'Name, email, role, and department are required')
      return
    }
    const employee = await prisma.employee.create({
      data: {
        name, email, phone, role, department, status, workload, salary,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        notes,
      },
    })
    emitDashboardEvent('employee:new', employee)
    logActivity({ action: 'EMPLOYEE_CREATED', entity: 'Employee', entityId: employee.id, details: `Employee: ${name}`, adminUserId: req.admin?.id, ipAddress: req.ip })
    sendSuccess(res, employee, 'Employee created', 201)
  } catch (err) { next(err) }
}

export async function list(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = getPagination(req.query as any)
    const { status, department, search } = req.query as Record<string, string>

    const where: any = {}
    if (status) where.status = status
    if (department) where.department = { contains: department, mode: 'insensitive' }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.employee.count({ where }),
    ])

    sendSuccess(res, employees, 'Employees retrieved', 200, buildPaginationMeta(total, page, limit))
  } catch (err) { next(err) }
}

export async function getById(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id } })
    if (!employee) { sendError(res, 'Employee not found', 404); return }
    sendSuccess(res, employee)
  } catch (err) { next(err) }
}

export async function update(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, role, department, status, workload, salary, notes } = req.body
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(department && { department }),
        ...(status && { status }),
        ...(workload !== undefined && { workload }),
        ...(salary !== undefined && { salary }),
        ...(notes !== undefined && { notes }),
      },
    })
    sendSuccess(res, employee, 'Employee updated')
  } catch (err) { next(err) }
}

export async function remove(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    await prisma.employee.delete({ where: { id: req.params.id } })
    sendSuccess(res, null, 'Employee deleted')
  } catch (err) { next(err) }
}

export async function stats(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const [total, statusCounts, deptCounts] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.employee.groupBy({ by: ['department'], _count: { department: true } }),
    ])

    sendSuccess(res, {
      total,
      byStatus: statusCounts.reduce((acc: any, s) => { acc[s.status] = s._count.status; return acc }, {}),
      byDepartment: deptCounts.reduce((acc: any, d) => { acc[d.department] = d._count.department; return acc }, {}),
    })
  } catch (err) { next(err) }
}
