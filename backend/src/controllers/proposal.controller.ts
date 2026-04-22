import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { getPagination, buildPaginationMeta } from '../types'
import { emitDashboardEvent } from '../config/socket'
import { logActivity } from '../services/activity.service'
import { sendMail, proposalSentEmail, proposalAcceptedEmail, proposalRejectedEmail, memberAssignmentEmail, projectCompletionShareEmail, baseTemplate } from '../services/email.service'
import { sendWhatsAppMessage, sendBulkWhatsApp, notifyAdmin, waTemplates } from '../services/whatsapp.service'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'raleem811811@gmail.com'

// ─── Create Proposal ─────────────────────────────────────────────────────────

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { clientId, title, description, budget, currency, timeline } = req.body
    if (!clientId || !title || !description) {
      sendError(res, 'Client, title, and description are required')
      return
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) { sendError(res, 'Client not found', 404); return }

    const proposal = await prisma.proposal.create({
      data: { clientId, title, description, budget: budget || 0, currency: currency || 'USD', timeline: timeline || null },
      include: { client: true },
    })

    // Email client about new proposal
    try {
      await sendMail({
        to: client.email,
        subject: `[Techlution AI] New Proposal — ${title}`,
        html: proposalSentEmail({ clientName: client.name, title, description, budget }),
      })
    } catch { /* email optional */ }

    emitDashboardEvent('inquiry:new', proposal)
    logActivity({ action: 'PROPOSAL_CREATED', entity: 'Proposal', entityId: proposal.id, details: `Proposal: ${title} for ${client.name}`, adminUserId: req.admin?.id, ipAddress: req.ip })

    // WhatsApp: notify client about proposal (if phone exists)
    if (client.phone) {
      void sendWhatsAppMessage(client.phone, waTemplates.proposalSent(title, budget || 0), {
        trigger: 'proposal_sent', fallbackEmail: client.email, fallbackSubject: `New Proposal — ${title}`,
      })
    }

    sendSuccess(res, proposal, 'Proposal created', 201)
  } catch (err) { next(err) }
}

// ─── List Proposals ──────────────────────────────────────────────────────────

export async function list(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = getPagination(req.query as any)
    const { status, search, clientId } = req.query as Record<string, string>

    const where: any = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { client: { select: { id: true, name: true, email: true, company: true } } } }),
      prisma.proposal.count({ where }),
    ])

    sendSuccess(res, proposals, 'Proposals retrieved', 200, buildPaginationMeta(total, page, limit))
  } catch (err) { next(err) }
}

// ─── Get Proposal by ID ─────────────────────────────────────────────────────

export async function getById(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const proposal = await prisma.proposal.findUnique({ where: { id: req.params.id }, include: { client: true } })
    if (!proposal) { sendError(res, 'Proposal not found', 404); return }
    sendSuccess(res, proposal)
  } catch (err) { next(err) }
}

// ─── Update Proposal Status (ACCEPT / REJECT) ──────────────────────────────

export async function updateStatus(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body
    if (!status || !['ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) {
      sendError(res, 'Valid status required: PENDING, ACCEPTED, REJECTED')
      return
    }

    const proposal = await prisma.proposal.findUnique({ where: { id: req.params.id }, include: { client: true } })
    if (!proposal) { sendError(res, 'Proposal not found', 404); return }

    const updated = await prisma.proposal.update({
      where: { id: req.params.id },
      data: { status },
      include: { client: true },
    })

    // ─── AUTOMATION: If ACCEPTED → auto-create project + update client + finance ───
    if (status === 'ACCEPTED') {
      // Create project entry in finance as INCOME
      const financeRecord = await prisma.finance.create({
        data: {
          type: 'INCOME',
          amount: proposal.budget,
          description: `Project: ${proposal.title}`,
          category: 'PROJECT',
          projectRef: proposal.id,
          received: false,
        },
      })

      // Update client status to ACTIVE and increment projects
      await prisma.client.update({
        where: { id: proposal.clientId },
        data: {
          status: 'ACTIVE',
          projects: { increment: 1 },
          revenue: { increment: proposal.budget },
        },
      })

      // Update proposal with project reference
      await prisma.proposal.update({
        where: { id: req.params.id },
        data: { projectRef: financeRecord.id },
      })

      // Email client
      try {
        await sendMail({
          to: proposal.client.email,
          subject: `[Techlution AI] Proposal Accepted — ${proposal.title}`,
          html: proposalAcceptedEmail({ clientName: proposal.client.name, title: proposal.title, budget: proposal.budget }),
        })
      } catch { /* optional */ }

      emitDashboardEvent('finance:new', financeRecord)
      emitDashboardEvent('client:update', { id: proposal.clientId })
      logActivity({ action: 'PROPOSAL_ACCEPTED', entity: 'Proposal', entityId: proposal.id, details: `Accepted: ${proposal.title} — $${proposal.budget}`, adminUserId: req.admin?.id, ipAddress: req.ip })

      // WhatsApp: notify client about acceptance
      if (proposal.client.phone) {
        void sendWhatsAppMessage(proposal.client.phone, waTemplates.proposalAccepted(proposal.title), {
          trigger: 'proposal_accepted', fallbackEmail: proposal.client.email,
        })
      }
    }

    if (status === 'REJECTED') {
      try {
        await sendMail({
          to: proposal.client.email,
          subject: `[Techlution AI] Proposal Update — ${proposal.title}`,
          html: proposalRejectedEmail({ clientName: proposal.client.name, title: proposal.title }),
        })
      } catch { /* optional */ }

      logActivity({ action: 'PROPOSAL_REJECTED', entity: 'Proposal', entityId: proposal.id, details: `Rejected: ${proposal.title}`, adminUserId: req.admin?.id, ipAddress: req.ip })

      // WhatsApp: notify client about rejection
      if (proposal.client.phone) {
        void sendWhatsAppMessage(proposal.client.phone, waTemplates.proposalRejected(proposal.title), {
          trigger: 'proposal_rejected', fallbackEmail: proposal.client.email,
        })
      }
    }

    emitDashboardEvent('inquiry:update', updated)
    sendSuccess(res, updated, `Proposal ${status.toLowerCase()}`)
  } catch (err) { next(err) }
}

// ─── Delete Proposal ─────────────────────────────────────────────────────────

export async function remove(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    await prisma.proposal.delete({ where: { id: req.params.id } })
    logActivity({ action: 'PROPOSAL_DELETED', entity: 'Proposal', entityId: req.params.id, adminUserId: req.admin?.id, ipAddress: req.ip })
    sendSuccess(res, null, 'Proposal deleted')
  } catch (err) { next(err) }
}

// ─── Start Project from Proposal ─────────────────────────────────────────────

export async function startProject(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const {
      title, description, budget, currency = 'USD', timeline, deadline,
      memberIds = [], newMembers = [],
      fiverrFeePercent = 0, zakatEnabled = false, zakatPercent = 2.5, otherCosts = [],
      amountReceived = true,
    } = req.body

    const proposal = await prisma.proposal.findUnique({ where: { id }, include: { client: true } })
    if (!proposal) { sendError(res, 'Proposal not found', 404); return }

    // 1. Create new members if any
    const createdMemberIds: string[] = []
    for (const m of newMembers) {
      if (!m.name || !m.email) continue
      let existing = await prisma.employee.findUnique({ where: { email: m.email } })
      if (!existing) {
        existing = await prisma.employee.create({
          data: {
            name: m.name, email: m.email, phone: m.phone || null,
            role: m.role || 'Developer', department: m.department || 'Engineering',
            skills: m.skills || [], isFounder: false,
          },
        })
        emitDashboardEvent('employee:new', existing)
      }
      createdMemberIds.push(existing.id)
    }

    const allMemberIds = [...new Set([...memberIds, ...createdMemberIds])]

    // 2. Ensure founder is included (by isFounder flag or email fallback)
    const founder = await prisma.employee.findFirst({ where: { OR: [{ isFounder: true }, { email: 'raleem811811@gmail.com' }] } })
    if (founder && !allMemberIds.includes(founder.id)) {
      allMemberIds.push(founder.id)
    }

    // 3. Create project (using the Project model)
    const slug = (title || proposal.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const project = await prisma.project.create({
      data: {
        title: title || proposal.title,
        slug: `${slug}-${Date.now().toString(36)}`,
        shortDescription: (description || proposal.description).substring(0, 200),
        fullDescription: description || proposal.description,
        category: 'OTHER',
        features: [],
        workflowSteps: [],
        benefits: [],
        images: [],
        status: 'ACTIVE',
        tags: [],
        techStack: [],
        durationWeeks: timeline ? parseInt(timeline) || null : null,
        deadline: deadline ? new Date(deadline) : null,
        createdById: (await prisma.user.findFirst())?.id || '',
      },
    })

    // 4. Create project assignments
    for (const memberId of allMemberIds) {
      await prisma.projectAssignment.create({
        data: { projectRef: project.id, employeeId: memberId, roleInProject: 'Developer' },
      }).catch(() => { /* unique constraint = already assigned */ })
    }

    // 5. Create finance record
    const totalAmount = budget || proposal.budget
    const fiverrDeduction = totalAmount * (fiverrFeePercent / 100)
    const zakatDeduction = zakatEnabled ? totalAmount * (zakatPercent / 100) : 0
    const otherTotal = (otherCosts as any[]).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0)
    const totalDeductions = fiverrDeduction + zakatDeduction + otherTotal
    const netAmount = totalAmount - totalDeductions
    const totalMembers = allMemberIds.length
    const sharePerPerson = totalMembers > 0 ? netAmount / totalMembers : 0

    const projectFinance = await prisma.projectFinance.create({
      data: {
        projectRef: project.id, totalAmount, currency, fiverrFeePercent,
        zakatEnabled, zakatPercent, otherCosts: otherCosts as any,
        totalDeductions, netAmount, sharePerPerson, totalMembers,
        founderIncluded: !!founder,
      },
    })

    // 6. Create shares for each member
    for (const memberId of allMemberIds) {
      await prisma.projectShare.create({
        data: { projectFinanceId: projectFinance.id, employeeId: memberId, shareAmount: sharePerPerson },
      }).catch(() => { /* */ })
    }

    // 7. Also create income in Finance
    await prisma.finance.create({
      data: { type: 'INCOME', amount: totalAmount, description: `Project: ${project.title}`, category: 'PROJECT', projectRef: project.id, received: !!amountReceived },
    })

    // 8. Update proposal status
    await prisma.proposal.update({
      where: { id },
      data: { status: 'STARTED', projectRef: project.id, budget: totalAmount, currency, timeline },
    })

    // 9. Update client
    await prisma.client.update({
      where: { id: proposal.clientId },
      data: { status: 'ACTIVE', projects: { increment: 1 }, revenue: { increment: totalAmount } },
    })

    // 10. Notify members (email + WhatsApp)
    const members = await prisma.employee.findMany({ where: { id: { in: allMemberIds } } })
    const projectFiles = await prisma.file.findMany({ where: { projectId: project.id } }).catch(() => [] as any[])
    for (const member of members) {
      const teamList = members.filter(m => m.id !== member.id).map(m => ({ name: m.name, role: m.role || 'Developer' }))
      // Email
      void sendMail({
        to: member.email,
        subject: `[Techlution AI] You've been assigned to: ${project.title}`,
        html: memberAssignmentEmail({
          memberName: member.name, projectTitle: project.title, role: 'Developer',
          description: (description || proposal.description).substring(0, 200),
          fullDescription: description || proposal.description,
          budget: totalAmount, currency, deadline, timeline,
          netAmount, sharePerPerson, totalDeductions,
          fiverrFeePercent, zakatEnabled, zakatPercent,
          teamMembers: teamList, totalMembers: allMemberIds.length,
          files: projectFiles.map((f: any) => f.url || f.name),
        }),
      })
      // WhatsApp
      if (member.phone) {
        void sendWhatsAppMessage(member.phone, waTemplates.projectAssigned(project.title, allMemberIds.length, timeline), {
          trigger: 'project_assigned', fallbackEmail: member.email,
        })
      }
    }

    // 11. Notify client
    if (proposal.client.email) {
      void sendMail({
        to: proposal.client.email,
        subject: `[Techlution AI] Your project has been started — ${project.title}`,
        html: baseTemplate('Project Started', `
          <div style="display:inline-block;padding:5px 14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:999px;font-size:12px;font-weight:600;color:#34d399;margin-bottom:16px;">🚀 Project Started</div>
          <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 12px;">Your Project Has Been Started!</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 20px;">Dear ${proposal.client.name},</p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 20px;">Great news! Your project <strong style="color:#f97316;">${project.title}</strong> has been started. Our team of <strong style="color:#22d3ee;">${allMemberIds.length}</strong> member(s) is now working on it.</p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;">We'll keep you updated on the progress.</p>
        `, '🚀 Project Started'),
      })
    }
    if (proposal.client.phone) {
      void sendWhatsAppMessage(proposal.client.phone,
        `✅ *Project Started*\n\nProject: ${project.title}\nTeam: ${allMemberIds.length} members\n${timeline ? `Timeline: ${timeline} weeks` : ''}\n\nOur team is now working on your project. We'll keep you updated!\n\n— Techlution AI`,
        { trigger: 'project_started', fallbackEmail: proposal.client.email }
      )
    }

    // 12. Notify admin
    void notifyAdmin(waTemplates.projectCreated(project.title), 'project_started')

    // 13. Send detailed email to company/admin email
    void sendMail({
      to: ADMIN_EMAIL,
      subject: `[Techlution AI] New Project Started — ${project.title}`,
      html: baseTemplate('New Project Started', `
        <div style="display:inline-block;padding:5px 14px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:999px;font-size:12px;font-weight:600;color:#fb923c;margin-bottom:16px;">🚀 New Project from Proposal</div>
        <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 20px;">Project Started from Proposal</h1>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📋 Project</span><span style="color:#e2e8f0;font-weight:600;">${project.title}</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">👤 Client</span><span style="color:#e2e8f0;">${proposal.client.name} (${proposal.client.email})</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">💰 Budget</span><span style="color:#22d3ee;font-weight:700;">${currency} ${totalAmount.toLocaleString()}</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📊 Fiverr Fee</span><span style="color:#f87171;">-${currency} ${fiverrDeduction.toLocaleString()} (${fiverrFeePercent}%)</span></td></tr>
          ${zakatEnabled ? `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">🕌 Zakat</span><span style="color:#f87171;">-${currency} ${zakatDeduction.toLocaleString()} (${zakatPercent}%)</span></td></tr>` : ''}
          ${(otherCosts as any[]).map((c: any) => `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📎 ${c.label || 'Other'}</span><span style="color:#f87171;">-${currency} ${(Number(c.amount) || 0).toLocaleString()}</span></td></tr>`).join('')}
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">✅ Net Amount</span><span style="color:#4ade80;font-weight:700;">${currency} ${netAmount.toLocaleString()}</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">👥 Team</span><span style="color:#e2e8f0;">${members.map(m => `${m.name}${m.isFounder ? ' ⭐' : ''}`).join(', ')}</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">💵 Share/Person</span><span style="color:#e2e8f0;font-weight:600;">${currency} ${sharePerPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></td></tr>
          ${timeline ? `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">⏱️ Timeline</span><span style="color:#e2e8f0;">${timeline} weeks</span></td></tr>` : ''}
          ${deadline ? `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📅 Deadline</span><span style="color:#fb923c;">${new Date(deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></td></tr>` : ''}
          <tr><td style="padding:14px 18px;font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📩 Proposal</span><span style="color:#e2e8f0;">${proposal.title}</span></td></tr>
        </table>
      `, '🚀 Project Summary'),
    })

    emitDashboardEvent('project:update', project)
    emitDashboardEvent('finance:new', projectFinance)
    emitDashboardEvent('client:update', { id: proposal.clientId })
    logActivity({ action: 'PROJECT_STARTED', entity: 'Project', entityId: project.id, details: `Started from proposal: ${proposal.title} — $${totalAmount} — ${allMemberIds.length} members`, adminUserId: req.admin?.id, ipAddress: req.ip })

    sendSuccess(res, { project, projectFinance, memberCount: allMemberIds.length }, 'Project started successfully', 201)
  } catch (err) { next(err) }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function stats(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const [total, statusCounts, totalBudget] = await Promise.all([
      prisma.proposal.count(),
      prisma.proposal.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.proposal.aggregate({ where: { status: 'ACCEPTED' }, _sum: { budget: true } }),
    ])

    sendSuccess(res, {
      total,
      byStatus: statusCounts.reduce((acc: any, s) => { acc[s.status] = s._count.status; return acc }, {}),
      acceptedBudget: totalBudget._sum.budget ?? 0,
    })
  } catch (err) { next(err) }
}
