import prisma from '../config/database'
import logger from '../utils/logger'

export interface LogEntry {
  action: string
  entity?: string
  entityId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
  adminUserId?: string
}

export async function logActivity(entry: LogEntry): Promise<void> {
  try {
    await prisma.activityLog.create({ data: entry })
  } catch (err) {
    logger.error('Failed to log activity:', err)
  }
}

export async function getActivityLogs(options: {
  page?: number
  limit?: number
  action?: string
  adminUserId?: string
  from?: Date
  to?: Date
}) {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 50))
  const skip = (page - 1) * limit

  const where: any = {}
  if (options.action) where.action = { contains: options.action, mode: 'insensitive' }
  if (options.adminUserId) where.adminUserId = options.adminUserId
  if (options.from || options.to) {
    where.createdAt = {}
    if (options.from) where.createdAt.gte = options.from
    if (options.to) where.createdAt.lte = options.to
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { adminUser: { select: { name: true, username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ])

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
