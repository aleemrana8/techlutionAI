import prisma from '../config/database'
import { sendMail } from './email.service'
import { sendWhatsAppMessage, waTemplates, notifyAdmin } from './whatsapp.service'
import { logActivity } from './activity.service'
import { emitDashboardEvent } from '../config/socket'
import logger from '../utils/logger'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OtherCost {
  name: string
  amount: number
}

interface CalculateInput {
  projectRef: string
  totalAmount: number
  currency?: string
  fiverrFeePercent?: number
  zakatEnabled?: boolean
  zakatPercent?: number
  otherCosts?: OtherCost[]
  founderIncluded?: boolean
  teamMemberIds: string[]
  adminUserId?: string
}

// ─── Calculate Cost Sharing ──────────────────────────────────────────────────

export async function calculateSharing(input: CalculateInput) {
  const {
    projectRef,
    totalAmount,
    currency = 'USD',
    fiverrFeePercent = 0,
    zakatEnabled = false,
    zakatPercent = 2.5,
    otherCosts = [],
    founderIncluded = true,
    teamMemberIds,
    adminUserId,
  } = input

  // Calculate deductions
  const fiverrFee = (totalAmount * fiverrFeePercent) / 100
  const zakatAmount = zakatEnabled ? (totalAmount * zakatPercent) / 100 : 0
  const otherCostTotal = otherCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalDeductions = fiverrFee + zakatAmount + otherCostTotal
  const netAmount = totalAmount - totalDeductions

  // Get founder automatically if founderIncluded
  let memberIds = [...teamMemberIds]
  if (founderIncluded) {
    const founder = await prisma.employee.findFirst({ where: { OR: [{ isFounder: true }, { email: 'raleem811811@gmail.com' }] } })
    if (founder && !memberIds.includes(founder.id)) {
      memberIds.push(founder.id)
    }
  }

  const totalMembers = memberIds.length
  const sharePerPerson = totalMembers > 0 ? Math.round((netAmount / totalMembers) * 100) / 100 : 0

  // Upsert project finance record
  const projectFinance = await prisma.projectFinance.upsert({
    where: { projectRef },
    create: {
      projectRef,
      totalAmount,
      currency,
      fiverrFeePercent,
      zakatEnabled,
      zakatPercent,
      otherCosts: otherCosts as any,
      totalDeductions,
      netAmount,
      sharePerPerson,
      totalMembers,
      founderIncluded,
    },
    update: {
      totalAmount,
      currency,
      fiverrFeePercent,
      zakatEnabled,
      zakatPercent,
      otherCosts: otherCosts as any,
      totalDeductions,
      netAmount,
      sharePerPerson,
      totalMembers,
      founderIncluded,
      calculatedAt: new Date(),
    },
  })

  // Upsert assignments
  for (const empId of memberIds) {
    await prisma.projectAssignment.upsert({
      where: { projectRef_employeeId: { projectRef, employeeId: empId } },
      create: { projectRef, employeeId: empId },
      update: {},
    })
  }

  // Remove assignments for members no longer in the list
  await prisma.projectAssignment.deleteMany({
    where: { projectRef, employeeId: { notIn: memberIds } },
  })

  // Upsert share records
  for (const empId of memberIds) {
    await prisma.projectShare.upsert({
      where: { projectFinanceId_employeeId: { projectFinanceId: projectFinance.id, employeeId: empId } },
      create: { projectFinanceId: projectFinance.id, employeeId: empId, shareAmount: sharePerPerson },
      update: { shareAmount: sharePerPerson },
    })
  }

  // Remove shares for members no longer in the list
  await prisma.projectShare.deleteMany({
    where: { projectFinanceId: projectFinance.id, employeeId: { notIn: memberIds } },
  })

  // Fetch full share details
  const shares = await prisma.projectShare.findMany({
    where: { projectFinanceId: projectFinance.id },
    include: { employee: { select: { id: true, name: true, email: true, role: true, isFounder: true } } },
  })

  logActivity({
    action: 'PROJECT_FINANCE_CALCULATED',
    entity: 'ProjectFinance',
    entityId: projectFinance.id,
    details: `Project: ${projectRef} — Net: $${netAmount}, ${totalMembers} members, $${sharePerPerson}/person`,
    adminUserId,
  })

  emitDashboardEvent('finance:update', { projectRef, netAmount, sharePerPerson })

  return {
    projectFinance: {
      ...projectFinance,
      breakdown: {
        totalAmount,
        fiverrFee,
        zakatAmount,
        otherCostTotal,
        totalDeductions,
        netAmount,
        sharePerPerson,
        totalMembers,
      },
    },
    shares,
  }
}

// ─── Get Project Finance ─────────────────────────────────────────────────────

export async function getProjectFinance(projectRef: string) {
  const finance = await prisma.projectFinance.findUnique({
    where: { projectRef },
    include: {
      shares: {
        include: { employee: { select: { id: true, name: true, email: true, role: true, isFounder: true } } },
      },
    },
  })
  return finance
}

// ─── Get Assignments for a Project ───────────────────────────────────────────

export async function getAssignments(projectRef: string) {
  return prisma.projectAssignment.findMany({
    where: { projectRef },
    include: { employee: { select: { id: true, name: true, email: true, role: true, department: true, isFounder: true } } },
  })
}

// ─── Send Share Notifications ────────────────────────────────────────────────

export async function notifyShareholders(projectRef: string, projectTitle: string, type: 'assignment' | 'update' | 'completion') {
  const finance = await getProjectFinance(projectRef)
  if (!finance || !finance.shares.length) return

  // Fetch project deadline
  const project = await prisma.project.findUnique({ where: { id: projectRef }, select: { deadline: true } })
  const projectDeadline = project?.deadline || null

  // Re-fetch shares with phone for WhatsApp
  const sharesWithPhone = await prisma.projectShare.findMany({
    where: { projectFinanceId: finance.id },
    include: { employee: { select: { id: true, name: true, email: true, phone: true, role: true, isFounder: true } } },
  })

  const subjectMap = {
    assignment: `New Project Assignment: ${projectTitle}`,
    update: `Project Share Updated: ${projectTitle}`,
    completion: `Project Completed: ${projectTitle} — Final Share Details`,
  }

  const typeLabel = {
    assignment: '📋 You have been assigned to a new project',
    update: '🔄 Your project share has been updated',
    completion: '✅ Project has been completed — here is your final share',
  }

  const allMemberNames = sharesWithPhone.map(s => `${s.employee.name}${s.employee.isFounder ? ' ⭐' : ''} (${s.employee.role})`).join(', ')
  const otherCosts = (finance.otherCosts as any[]) || []
  const fiverrFee = finance.totalAmount * (finance.fiverrFeePercent / 100)
  const zakatAmount = finance.zakatEnabled ? finance.totalAmount * (finance.zakatPercent / 100) : 0
  const otherCostTotal = otherCosts.reduce((s: number, c: any) => s + (Number(c.amount || c.name ? c.amount : 0) || 0), 0)

  for (const share of sharesWithPhone) {
    const html = buildShareEmail({
      recipientName: share.employee.name,
      projectTitle,
      typeLabel: typeLabel[type],
      totalAmount: finance.totalAmount,
      currency: finance.currency || 'USD',
      fiverrFeePercent: finance.fiverrFeePercent,
      fiverrFee,
      zakatEnabled: finance.zakatEnabled,
      zakatPercent: finance.zakatPercent,
      zakatAmount,
      otherCosts,
      otherCostTotal,
      totalDeductions: finance.totalDeductions,
      netAmount: finance.netAmount,
      shareAmount: share.shareAmount,
      totalMembers: finance.totalMembers,
      sharePerPerson: finance.sharePerPerson,
      isFounder: share.employee.isFounder,
      allMemberNames,
      deadline: projectDeadline,
    })

    // Email notification
    try {
      await sendMail({ to: share.employee.email, subject: subjectMap[type], html })
      await prisma.emailLog.create({
        data: { to: share.employee.email, subject: subjectMap[type], type: `share_${type}`, projectRef, status: 'SENT' },
      })
      await prisma.projectShare.update({ where: { id: share.id }, data: { notified: true } })
    } catch (err: any) {
      await prisma.emailLog.create({
        data: { to: share.employee.email, subject: subjectMap[type], type: `share_${type}`, projectRef, status: 'FAILED', error: err.message },
      })
      logger.error(`Failed to notify ${share.employee.email}:`, err)
    }

    // WhatsApp notification
    if ((share.employee as any).phone) {
      const currencyLabel = finance.currency || 'USD'
      const waMsg = type === 'completion'
        ? `✅ *Project Completed — ${projectTitle}*\n\n💰 Total: ${currencyLabel} ${finance.totalAmount.toLocaleString()}\n📉 Deductions: ${currencyLabel} ${finance.totalDeductions.toLocaleString()}\n💵 Net: ${currencyLabel} ${finance.netAmount.toLocaleString()}\n👥 Members: ${finance.totalMembers}\n\n🎯 *Your Share: ${currencyLabel} ${share.shareAmount.toLocaleString()}*${share.employee.isFounder ? ' (Founder)' : ''}\n\nGreat work! 🎉\n— Techlution AI`
        : type === 'assignment'
        ? waTemplates.projectAssigned(projectTitle, finance.totalMembers)
        : `🔄 *Share Updated — ${projectTitle}*\n\nYour updated share: ${currencyLabel} ${share.shareAmount.toLocaleString()}\nTeam: ${finance.totalMembers} members\n\n— Techlution AI`
      void sendWhatsAppMessage((share.employee as any).phone, waMsg, {
        trigger: `share_${type}`, fallbackEmail: share.employee.email,
      })
    }
  }

  // Notify admin about team notification
  if (type === 'completion') {
    void notifyAdmin(`📊 Project completion notifications sent for: ${projectTitle} (${sharesWithPhone.length} members)`, 'project_completion')
  }

  // Send detailed summary to company email
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'raleem811811@gmail.com'
  const cur = finance.currency || 'USD'
  void sendMail({
    to: ADMIN_EMAIL,
    subject: `[Techlution AI] Share ${type === 'completion' ? 'Completion' : type === 'assignment' ? 'Assignment' : 'Update'} — ${projectTitle}`,
    html: buildShareEmail({
      recipientName: 'Admin',
      projectTitle,
      typeLabel: `📊 Team share ${type} summary for your records`,
      totalAmount: finance.totalAmount,
      currency: cur,
      fiverrFeePercent: finance.fiverrFeePercent,
      fiverrFee,
      zakatEnabled: finance.zakatEnabled,
      zakatPercent: finance.zakatPercent,
      zakatAmount,
      otherCosts,
      otherCostTotal,
      totalDeductions: finance.totalDeductions,
      netAmount: finance.netAmount,
      shareAmount: finance.sharePerPerson,
      totalMembers: finance.totalMembers,
      sharePerPerson: finance.sharePerPerson,
      isFounder: false,
      allMemberNames,
      deadline: projectDeadline,
    }),
  })
}

// ─── Mark Share as Paid ──────────────────────────────────────────────────────

export async function markSharePaid(shareId: string) {
  return prisma.projectShare.update({
    where: { id: shareId },
    data: { paymentStatus: 'PAID' },
  })
}

// ─── Email Template ──────────────────────────────────────────────────────────

function buildShareEmail(data: {
  recipientName: string
  projectTitle: string
  typeLabel: string
  totalAmount: number
  currency: string
  fiverrFeePercent: number
  fiverrFee: number
  zakatEnabled: boolean
  zakatPercent: number
  zakatAmount: number
  otherCosts: any[]
  otherCostTotal: number
  totalDeductions: number
  netAmount: number
  shareAmount: number
  totalMembers: number
  sharePerPerson: number
  isFounder: boolean
  allMemberNames: string
  deadline?: string | Date | null
}): string {
  const year = new Date().getFullYear()
  const c = data.currency
  const sym = c === 'PKR' ? '₨' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : '$'

  // Deadline analysis
  let deadlineRow = ''
  let deadlineSection = ''
  if (data.deadline) {
    const dl = new Date(data.deadline)
    const now = new Date(); now.setHours(0, 0, 0, 0); dl.setHours(0, 0, 0, 0)
    const diff = Math.ceil((dl.getTime() - now.getTime()) / 86400000)
    const dlFormatted = dl.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const dlColor = diff < 0 ? '#f87171' : diff <= 3 ? '#fbbf24' : diff <= 7 ? '#fb923c' : '#4ade80'
    const dlLabel = diff < 0 ? `${Math.abs(diff)} days overdue` : diff === 0 ? 'Due today' : `${diff} days remaining`
    deadlineRow = `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">📅 Project Deadline</span><span style="color:${dlColor};font-weight:700;">${dlFormatted}</span></td></tr><tr><td style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">⏳ Days Remaining</span><span style="color:${dlColor};font-weight:700;">${dlLabel}</span></td></tr>`
    deadlineSection = `<div style="background:rgba(${diff < 0 ? '248,113,113' : diff <= 7 ? '251,191,36' : '74,222,128'},0.06);border:1px solid rgba(${diff < 0 ? '248,113,113' : diff <= 7 ? '251,191,36' : '74,222,128'},0.15);border-radius:12px;padding:14px 18px;margin-bottom:16px;text-align:center;"><span style="font-size:13px;color:${dlColor};font-weight:700;">📅 Deadline: ${dlFormatted} — ${dlLabel}</span></div>`
  }

  const otherCostRows = data.otherCosts.filter((oc: any) => (oc.amount || 0) > 0).map((oc: any) =>
    `<tr><td style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">📌 ${oc.name || oc.label || 'Other Cost'}</span><span style="color:#f87171;font-weight:600;">-${sym}${Number(oc.amount).toLocaleString()}</span></td></tr>`
  ).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#070b14;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
<div style="max-width:640px;margin:0 auto;padding:32px 16px;">
<div style="background:linear-gradient(145deg,#0f172a,#1a2332);border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.4);">
  <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:28px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td><div style="font-size:24px;font-weight:800;"><span style="color:#f97316;">Techlution</span><span style="color:#e2e8f0;"> AI</span></div>
      <div style="font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Project Finance</div></td>
      <td style="text-align:right;"><div style="display:inline-block;padding:5px 14px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:999px;font-size:12px;font-weight:600;color:#fb923c;">💰 Share Details</div></td>
    </tr></table>
  </div>
  <div style="padding:32px;">
    <p style="font-size:15px;color:#94a3b8;margin:0 0 8px;">Hi <strong style="color:#fff;">${data.recipientName}</strong>${data.isFounder ? ' <span style="color:#fbbf24;font-size:12px;">⭐ Founder</span>' : ''},</p>
    <p style="font-size:14px;color:#94a3b8;margin:0 0 20px;">${data.typeLabel}</p>
    <div style="font-size:20px;font-weight:800;color:#fff;margin:0 0 20px;">📋 ${data.projectTitle}</div>

    ${deadlineSection}

    <!-- Full Expense Breakdown -->
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;margin-bottom:16px;">
      <div style="padding:14px 18px;background:rgba(6,182,212,0.05);border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;font-weight:700;color:#22d3ee;text-transform:uppercase;letter-spacing:1px;">💰 Financial Breakdown</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">💵 Total Project Budget</span><span style="color:#22d3ee;font-weight:700;font-size:15px;">${sym}${data.totalAmount.toLocaleString()}</span></td></tr>
        ${deadlineRow}
        ${data.fiverrFeePercent > 0 ? `<tr><td style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">🏷️ Fiverr Fee (${data.fiverrFeePercent}%)</span><span style="color:#f87171;font-weight:600;">-${sym}${data.fiverrFee.toLocaleString()}</span></td></tr>` : ''}
        ${data.zakatEnabled ? `<tr><td style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">🕌 Zakat (${data.zakatPercent}%)</span><span style="color:#f87171;font-weight:600;">-${sym}${data.zakatAmount.toLocaleString()}</span></td></tr>` : ''}
        ${otherCostRows}
        <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">📉 Total Deductions</span><span style="color:#f87171;font-weight:700;">-${sym}${data.totalDeductions.toLocaleString()}</span></td></tr>
        <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;background:rgba(74,222,128,0.03);"><span style="color:#64748b;display:inline-block;width:180px;">💵 Net Amount</span><span style="color:#4ade80;font-weight:800;font-size:16px;">${sym}${data.netAmount.toLocaleString()}</span></td></tr>
        <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">👥 Team Members</span><span style="color:#e2e8f0;font-weight:600;">${data.totalMembers}</span></td></tr>
        <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:180px;">📊 Share Per Person</span><span style="color:#22d3ee;font-weight:700;">${sym}${data.sharePerPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></td></tr>
        <tr><td style="padding:16px 18px;font-size:14px;background:rgba(249,115,22,0.05);"><span style="color:#64748b;display:inline-block;width:180px;">🎯 <strong>Your Share</strong></span><span style="color:#f97316;font-weight:800;font-size:20px;">${sym}${data.shareAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></td></tr>
      </table>
    </div>

    <!-- Team Members -->
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;margin-bottom:16px;">
      <p style="font-size:12px;color:#64748b;margin:0 0 10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">👥 Team Working on This Project</p>
      <p style="font-size:13px;color:#94a3b8;line-height:1.8;margin:0;">${data.allMemberNames}</p>
    </div>

    <!-- Thank You Message -->
    <div style="background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(6,182,212,0.08));border:1px solid rgba(249,115,22,0.15);border-radius:12px;padding:20px;text-align:center;">
      <p style="font-size:16px;font-weight:700;color:#fff;margin:0 0 8px;">🌟 Thank You for Your Contribution!</p>
      <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.6;">Your outstanding effort and commitment to <strong style="color:#22d3ee;">${data.projectTitle}</strong> is truly appreciated. Every contribution drives Techlution AI forward to deliver exceptional results. We value your talent and look forward to continued success together!</p>
    </div>
  </div>
  <div style="background:#0b1120;padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);">
    <div style="text-align:center;margin-bottom:12px;"><span style="font-size:16px;font-weight:800;color:#f97316;">Techlution</span><span style="font-size:16px;font-weight:800;color:#94a3b8;"> AI</span></div>
    <div style="text-align:center;font-size:12px;color:#64748b;margin-bottom:8px;">Innovate &bull; Automate &bull; Elevate</div>
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:12px 0;"></div>
    <div style="text-align:center;font-size:11px;color:#475569;">📍 City Park Road, Islamabad, Pakistan &bull; 📞 +92 315 1664843 &bull; ✉️ <a href="mailto:raleem811811@gmail.com" style="color:#f97316;text-decoration:none;">raleem811811@gmail.com</a></div>
    <div style="text-align:center;font-size:10px;color:#334155;margin-top:8px;">&copy; ${year} Techlution AI. All rights reserved.</div>
  </div>
</div></div></body></html>`
}
