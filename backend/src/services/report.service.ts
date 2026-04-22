import PDFDocument from 'pdfkit'
import prisma from '../config/database'
import { sendMail, baseTemplate } from './email.service'
import logger from '../utils/logger'
import { PassThrough } from 'stream'
import path from 'path'
import fs from 'fs'

// ─── Generate Weekly Report PDF ──────────────────────────────────────────────

export async function generateWeeklyReport(): Promise<Buffer> {
  const now = new Date()
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Gather all data
  const [
    totalVisitors, weekVisitors,
    totalLeads, weekLeads, newLeads, convertedLeads,
    totalClients, activeClients,
    totalProjects,
    totalEmployees, activeEmployees,
    incomeAgg, expenseAgg,
    weekIncome, weekExpense,
    recentLeads,
    overloadedEmployees,
    pendingShares,
  ] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitor.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'CLOSED' } }),
    prisma.client.count(),
    prisma.client.count({ where: { status: 'ACTIVE' } }),
    prisma.project.count(),
    prisma.employee.count(),
    prisma.employee.count({ where: { status: 'ACTIVE' } }),
    prisma.finance.aggregate({ where: { type: 'INCOME' }, _sum: { amount: true } }),
    prisma.finance.aggregate({ where: { type: 'EXPENSE' }, _sum: { amount: true } }),
    prisma.finance.aggregate({ where: { type: 'INCOME', date: { gte: weekAgo } }, _sum: { amount: true } }),
    prisma.finance.aggregate({ where: { type: 'EXPENSE', date: { gte: weekAgo } }, _sum: { amount: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: weekAgo } }, take: 10, orderBy: { createdAt: 'desc' }, select: { name: true, service: true, status: true, createdAt: true } }),
    prisma.employee.findMany({ where: { workload: { gt: 80 } }, select: { name: true, workload: true, department: true } }),
    prisma.projectShare.count({ where: { paymentStatus: 'PENDING' } }),
  ])

  const totalIncome = incomeAgg._sum.amount ?? 0
  const totalExpenses = expenseAgg._sum.amount ?? 0
  const profit = totalIncome - totalExpenses
  const weeklyIncome = weekIncome._sum.amount ?? 0
  const weeklyExpenses = weekExpense._sum.amount ?? 0
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

  // Generate PDF
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const orange = '#f97316'
    const dark = '#0f172a'
    const gray = '#64748b'
    const white = '#ffffff'

    // ── Header ───────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 100).fill(dark)
    doc.fontSize(28).fill(orange).text('Techlution', 50, 30, { continued: true })
    doc.fill(white).text(' AI')
    doc.fontSize(10).fill(gray).text('Weekly Business Report', 50, 65)
    doc.fill(gray).text(`Generated: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 80)
    doc.fill(gray).text(`Period: ${weekAgo.toLocaleDateString()} — ${now.toLocaleDateString()}`, 300, 80)

    doc.moveDown(3)

    // ── Executive Summary ────────────────────────────────────────────────
    doc.fontSize(16).fill(dark).text('Executive Summary', 50)
    doc.moveDown(0.5)
    doc.fontSize(10).fill(gray)

    const summaryData = [
      ['Metric', 'Total', 'This Week'],
      ['Visitors', totalVisitors.toString(), weekVisitors.toString()],
      ['Inquiries', totalLeads.toString(), weekLeads.toString()],
      ['New Inquiries (Pending)', newLeads.toString(), '-'],
      ['Converted Inquiries', convertedLeads.toString(), `${conversionRate}% rate`],
      ['Clients', totalClients.toString(), `${activeClients} active`],
      ['Projects', totalProjects.toString(), '-'],
      ['Team Members', totalEmployees.toString(), `${activeEmployees} active`],
    ]

    drawTable(doc, summaryData, 50, doc.y, [200, 120, 120])
    doc.moveDown(1.5)

    // ── Financial Overview ───────────────────────────────────────────────
    doc.fontSize(16).fill(dark).text('Financial Overview')
    doc.moveDown(0.5)

    const financeData = [
      ['Category', 'All Time', 'This Week'],
      ['Revenue', `$${totalIncome.toLocaleString()}`, `$${weeklyIncome.toLocaleString()}`],
      ['Expenses', `$${totalExpenses.toLocaleString()}`, `$${weeklyExpenses.toLocaleString()}`],
      ['Profit', `$${profit.toLocaleString()}`, `$${(weeklyIncome - weeklyExpenses).toLocaleString()}`],
      ['Pending Payouts', `${pendingShares} shares`, '-'],
    ]

    drawTable(doc, financeData, 50, doc.y, [200, 120, 120])
    doc.moveDown(1.5)

    // ── Team Workload ────────────────────────────────────────────────────
    if (overloadedEmployees.length > 0) {
      doc.fontSize(16).fill(dark).text('⚠️ Overloaded Team Members')
      doc.moveDown(0.5)

      const teamData = [['Name', 'Department', 'Workload']]
      for (const emp of overloadedEmployees) {
        teamData.push([emp.name, emp.department, `${emp.workload}%`])
      }
      drawTable(doc, teamData, 50, doc.y, [200, 140, 100])
      doc.moveDown(1.5)
    }

    // ── Recent Inquiries ─────────────────────────────────────────────────────
    if (recentLeads.length > 0) {
      doc.fontSize(16).fill(dark).text('Recent Inquiries')
      doc.moveDown(0.5)

      const leadData = [['Name', 'Service', 'Status', 'Date']]
      for (const lead of recentLeads) {
        leadData.push([lead.name, lead.service || '-', lead.status, lead.createdAt.toLocaleDateString()])
      }
      drawTable(doc, leadData, 50, doc.y, [130, 130, 80, 100])
      doc.moveDown(1.5)
    }

    // ── Recommendations ──────────────────────────────────────────────────
    doc.fontSize(16).fill(dark).text('AI Recommendations')
    doc.moveDown(0.5)
    doc.fontSize(10).fill(gray)

    const recs: string[] = []
    if (newLeads > 5) recs.push(`• Follow up on ${newLeads} pending leads immediately`)
    if (overloadedEmployees.length > 0) recs.push(`• ${overloadedEmployees.length} team member(s) are overloaded — consider task redistribution`)
    if (conversionRate < 15 && totalLeads > 10) recs.push(`• Lead conversion rate is ${conversionRate}% — review follow-up process`)
    if (weeklyIncome < weeklyExpenses) recs.push('• Weekly expenses exceed income — review cost structure')
    if (pendingShares > 0) recs.push(`• ${pendingShares} pending share payouts need attention`)
    if (recs.length === 0) recs.push('• All metrics look healthy! Keep up the great work.')

    for (const rec of recs) {
      doc.text(rec)
      doc.moveDown(0.3)
    }

    // ── Footer ───────────────────────────────────────────────────────────
    doc.moveDown(2)
    doc.fontSize(8).fill(gray).text('This report was auto-generated by Techlution AI Admin Portal.', 50, doc.page.height - 50, { align: 'center' })

    doc.end()
  })
}

// ─── Table Drawing Helper ────────────────────────────────────────────────────

function drawTable(doc: PDFKit.PDFDocument, data: string[][], x: number, y: number, colWidths: number[]) {
  const rowHeight = 22
  const fontSize = 9
  const headerBg = '#0f172a'
  const altBg = '#f8fafc'

  let currentY = y

  for (let row = 0; row < data.length; row++) {
    let currentX = x

    // Header row
    if (row === 0) {
      doc.rect(x, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(headerBg)
      doc.fontSize(fontSize).fill('#ffffff')
    } else if (row % 2 === 0) {
      doc.rect(x, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(altBg)
      doc.fontSize(fontSize).fill('#334155')
    } else {
      doc.fontSize(fontSize).fill('#334155')
    }

    for (let col = 0; col < data[row].length; col++) {
      doc.text(data[row][col], currentX + 8, currentY + 6, { width: colWidths[col] - 16 })
      currentX += colWidths[col]
    }
    currentY += rowHeight
  }

  // Border
  doc.rect(x, y, colWidths.reduce((a, b) => a + b, 0), currentY - y).stroke('#e2e8f0')
}

// ─── Save Report to Disk ─────────────────────────────────────────────────────

export async function saveReport(): Promise<string> {
  const buffer = await generateWeeklyReport()
  const reportsDir = path.join(__dirname, '../../reports')
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })

  const filename = `weekly-report-${new Date().toISOString().slice(0, 10)}.pdf`
  const filepath = path.join(reportsDir, filename)
  fs.writeFileSync(filepath, buffer)
  return filepath
}

// ─── Email Weekly Report ─────────────────────────────────────────────────────

export async function emailWeeklyReport() {
  try {
    const filepath = await saveReport()
    const adminEmail = process.env.ADMIN_EMAIL ?? 'raleem811811@gmail.com'

    await sendMail({
      to: adminEmail,
      subject: `Techlution AI — Weekly Report (${new Date().toLocaleDateString()})`,
      html: baseTemplate('Weekly Report', `
        <div style="display:inline-block;padding:5px 14px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:999px;font-size:12px;font-weight:600;color:#fb923c;margin-bottom:16px;">📊 Weekly Report</div>
        <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 20px;">Weekly Business Report</h1>
        <p style="color:#94a3b8;font-size:15px;line-height:1.7;">Please find attached the weekly business report for <strong style="color:#f97316;">${new Date().toLocaleDateString()}</strong>.</p>
        <p style="color:#64748b;font-size:12px;margin-top:24px;">Auto-generated by Techlution AI Admin Portal</p>
      `, '📊 Weekly Report'),
      attachments: [{ filename: path.basename(filepath), path: filepath }],
    })

    await prisma.emailLog.create({
      data: { to: adminEmail, subject: 'Weekly Report', type: 'weekly_report', status: 'SENT' },
    })

    logger.info('Weekly report emailed to ' + adminEmail)
  } catch (err) {
    logger.error('Failed to email weekly report:', err)
  }
}
