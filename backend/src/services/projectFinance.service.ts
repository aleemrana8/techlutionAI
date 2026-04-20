import prisma from '../config/database'
import { sendMail } from './email.service'
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
    const founder = await prisma.employee.findFirst({ where: { isFounder: true } })
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

  for (const share of finance.shares) {
    const html = buildShareEmail({
      recipientName: share.employee.name,
      projectTitle,
      typeLabel: typeLabel[type],
      totalAmount: finance.totalAmount,
      totalDeductions: finance.totalDeductions,
      netAmount: finance.netAmount,
      shareAmount: share.shareAmount,
      totalMembers: finance.totalMembers,
      isFounder: share.employee.isFounder,
    })

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
  }
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
  totalDeductions: number
  netAmount: number
  shareAmount: number
  totalMembers: number
  isFounder: boolean
}): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#070b14;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
<div style="max-width:640px;margin:0 auto;padding:32px 16px;">
<div style="background:linear-gradient(145deg,#0f172a,#1a2332);border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.4);">
  <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:28px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
    <div style="font-size:24px;font-weight:800;"><span style="color:#f97316;">Techlution</span><span style="color:#e2e8f0;"> AI</span></div>
    <div style="font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Project Finance</div>
  </div>
  <div style="padding:32px;">
    <p style="font-size:15px;color:#94a3b8;margin:0 0 8px;">Hi <strong style="color:#fff;">${data.recipientName}</strong>${data.isFounder ? ' (Founder)' : ''},</p>
    <p style="font-size:14px;color:#94a3b8;margin:0 0 20px;">${data.typeLabel}</p>
    <div style="font-size:18px;font-weight:800;color:#fff;margin:0 0 20px;">📋 ${data.projectTitle}</div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:150px;">💰 Total Amount</span><span style="color:#22d3ee;font-weight:700;">$${data.totalAmount.toLocaleString()}</span></td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:150px;">📉 Total Deductions</span><span style="color:#f87171;font-weight:700;">-$${data.totalDeductions.toLocaleString()}</span></td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:150px;">💵 Net Amount</span><span style="color:#4ade80;font-weight:700;">$${data.netAmount.toLocaleString()}</span></td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:150px;">👥 Team Members</span><span style="color:#e2e8f0;font-weight:600;">${data.totalMembers}</span></td></tr>
      <tr><td style="padding:14px 18px;font-size:13px;"><span style="color:#64748b;display:inline-block;width:150px;">🎯 Your Share</span><span style="color:#f97316;font-weight:800;font-size:18px;">$${data.shareAmount.toLocaleString()}</span></td></tr>
    </table>
  </div>
  <div style="background:#0b1120;padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
    <span style="font-size:14px;font-weight:800;color:#f97316;">Techlution</span><span style="font-size:14px;font-weight:800;color:#94a3b8;"> AI</span>
    <div style="font-size:10px;color:#334155;margin-top:8px;">&copy; ${year} Techlution AI. All rights reserved.</div>
  </div>
</div></div></body></html>`
}
