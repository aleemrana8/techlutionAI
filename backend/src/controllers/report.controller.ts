import { Response, NextFunction } from 'express'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { generateWeeklyReport, saveReport, emailWeeklyReport } from '../services/report.service'
import { notifyAdmin, waTemplates } from '../services/whatsapp.service'
import prisma from '../config/database'

// ─── Download Report (generate on-the-fly) ──────────────────────────────────

export async function downloadReport(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const buffer = await generateWeeklyReport()
    const filename = `techlution-report-${new Date().toISOString().slice(0, 10)}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', buffer.length)
    res.end(buffer)
  } catch (err) { next(err) }
}

// ─── Save and get path ──────────────────────────────────────────────────────

export async function generateReport(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const filepath = await saveReport()

    // WhatsApp: notify admin that report is ready
    const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/admin/reports/download`
    void notifyAdmin(waTemplates.reportReady('Weekly Report', downloadUrl), 'report_generated')

    sendSuccess(res, { filepath }, 'Report generated')
  } catch (err) { next(err) }
}

// ─── Email report now ───────────────────────────────────────────────────────

export async function emailReport(_req: AdminRequest, res: Response, next: NextFunction) {
  try {
    await emailWeeklyReport()
    sendSuccess(res, null, 'Report emailed successfully')
  } catch (err) { next(err) }
}

// ─── List email logs ────────────────────────────────────────────────────────

export async function getEmailLogs(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { type, limit: lim } = req.query as Record<string, string>
    const take = Math.min(parseInt(lim || '50'), 200)
    const where: any = {}
    if (type) where.type = type

    const logs = await prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    })
    sendSuccess(res, logs)
  } catch (err) { next(err) }
}
