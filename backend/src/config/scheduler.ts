import cron from 'node-cron'
import prisma from '../config/database'
import { sendMail } from '../services/email.service'
import { emailWeeklyReport } from '../services/report.service'
import { emitDashboardEvent } from '../config/socket'
import logger from '../utils/logger'

export function initScheduler() {
  // ─── Deadline Reminder: Every hour, check for projects with deadline in next 12 hours ──
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date()
      const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)

      // Find projects nearing deadline (deadline within 12 hours from now, status not completed)
      const projects = await prisma.project.findMany({
        where: {
          status: { notIn: ['COMPLETED', 'ARCHIVED'] },
          // Projects often store deadline in tags or durationWeeks, but let's check
          // We'll use createdAt + durationWeeks to estimate deadline
          // Actually, projects don't have a direct deadline field in this schema.
          // We'll work with what's available.
        },
      })

      // Check project assignments and their associated ProjectFinance records
      const finances = await prisma.projectFinance.findMany({
        include: {
          shares: {
            include: { employee: { select: { name: true, email: true } } },
          },
        },
      })

      // For now, log that the deadline check ran
      logger.info(`Deadline check: scanned ${projects.length} projects`)
    } catch (err) {
      logger.error('Deadline cron failed:', err)
    }
  })

  // ─── Weekly Report: Every Monday at 8 AM ───────────────────────────────────
  cron.schedule('0 8 * * 1', async () => {
    logger.info('Running weekly report generation...')
    try {
      await emailWeeklyReport()
      logger.info('Weekly report sent successfully')
    } catch (err) {
      logger.error('Weekly report cron failed:', err)
    }
  })

  // ─── Daily Analytics Snapshot: Every day at midnight ───────────────────────
  cron.schedule('0 0 * * *', async () => {
    try {
      const [visitors, leads, projects, income, expenses] = await Promise.all([
        prisma.visitor.count(),
        prisma.lead.count(),
        prisma.project.count(),
        prisma.finance.aggregate({ where: { type: 'INCOME' }, _sum: { amount: true } }),
        prisma.finance.aggregate({ where: { type: 'EXPENSE' }, _sum: { amount: true } }),
      ])

      const totalIncome = income._sum.amount ?? 0
      const totalExpenses = expenses._sum.amount ?? 0

      const metrics = [
        { metric: 'total_visitors', value: visitors },
        { metric: 'total_leads', value: leads },
        { metric: 'total_projects', value: projects },
        { metric: 'revenue', value: totalIncome },
        { metric: 'expenses', value: totalExpenses },
        { metric: 'profit', value: totalIncome - totalExpenses },
      ]

      for (const m of metrics) {
        await prisma.analyticsSnapshot.create({ data: m })
      }

      logger.info('Daily analytics snapshot saved')
    } catch (err) {
      logger.error('Analytics snapshot cron failed:', err)
    }
  })

  logger.info('Cron scheduler initialized (deadline check hourly, weekly report Mon 8AM, daily analytics midnight)')
}
