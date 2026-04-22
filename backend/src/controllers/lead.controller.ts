import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { getPagination, buildPaginationMeta } from '../types'
import { sendMail, inquiryResponseEmail, memberAssignmentEmail, baseTemplate } from '../services/email.service'
import { emitDashboardEvent } from '../config/socket'
import { logActivity } from '../services/activity.service'
import { sendWhatsAppMessage, notifyAdmin, waTemplates } from '../services/whatsapp.service'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'raleem811811@gmail.com'

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, service, message, status } = req.body
    if (!name || !message) {
      sendError(res, 'Name and message are required')
      return
    }
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || '',
        phone,
        service,
        message,
        status: status || 'NEW',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    })

    // Email notification to admin
    try {
      await sendMail({
        to: process.env.ADMIN_EMAIL || 'raleem811811@gmail.com',
        subject: `[Techlution AI] New Lead — ${service || 'General'} — ${name}`,
        html: baseTemplate('New Lead Received', `
          <div style="display:inline-block;padding:5px 14px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);border-radius:999px;font-size:12px;font-weight:600;color:#22d3ee;margin-bottom:16px;">📩 New Lead</div>
          <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 20px;">New Lead Received</h1>
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
            <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">👤 Name</span><span style="color:#e2e8f0;font-weight:600;">${name}</span></td></tr>
            <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">✉️ Email</span><span style="color:#e2e8f0;">${email || 'N/A'}</span></td></tr>
            <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">📞 Phone</span><span style="color:#e2e8f0;">${phone || 'N/A'}</span></td></tr>
            <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">🏷️ Service</span><span style="color:#f97316;font-weight:700;">${service || 'N/A'}</span></td></tr>
          </table>
          <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;font-size:14px;color:#94a3b8;line-height:1.7;margin-top:16px;">${message}</div>
        `, '📩 New Lead'),
      })
    } catch { /* email is optional */ }

    emitDashboardEvent('inquiry:new', lead)
    logActivity({ action: 'LEAD_CREATED', entity: 'Lead', entityId: lead.id, details: `Lead: ${name}`, adminUserId: req.admin?.id, ipAddress: req.ip })

    sendSuccess(res, lead, 'Lead created', 201)
  } catch (err) { next(err) }
}

export async function list(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = getPagination(req.query as any)
    const { status, search, type } = req.query as Record<string, string>

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { service: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.lead.count({ where }),
    ])

    sendSuccess(res, leads, 'Leads retrieved', 200, buildPaginationMeta(total, page, limit))
  } catch (err) { next(err) }
}

export async function getById(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) { sendError(res, 'Lead not found', 404); return }
    sendSuccess(res, lead)
  } catch (err) { next(err) }
}

export async function update(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { status, service, message } = req.body
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(service && { service }),
        ...(message && { message }),
      },
    })
    sendSuccess(res, lead, 'Lead updated')
  } catch (err) { next(err) }
}

export async function remove(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } })
    sendSuccess(res, null, 'Lead deleted')
  } catch (err) { next(err) }
}

export async function stats(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { type } = req.query as Record<string, string>
    const where: any = {}
    if (type) where.type = type

    const [total, statusCounts] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.groupBy({ by: ['status'], where, _count: { status: true } }),
    ])

    sendSuccess(res, {
      total,
      byStatus: statusCounts.reduce((acc: any, s) => {
        acc[s.status] = s._count.status
        return acc
      }, {}),
    })
  } catch (err) { next(err) }
}

// ─── Respond to Inquiry ──────────────────────────────────────────────────────

export async function respond(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { response } = req.body
    if (!response) { sendError(res, 'Response text is required'); return }

    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) { sendError(res, 'Inquiry not found', 404); return }

    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status: 'RESPONDED', response },
    })

    // Email the response to the user (fire-and-forget, don't block response)
    if (lead.email) {
      sendMail({
        to: lead.email,
        subject: `[Techlution AI] Response to Your Inquiry`,
        html: inquiryResponseEmail({ name: lead.name, originalMessage: lead.message, response }),
      }).catch(() => { /* email delivery is optional */ })
    }

    logActivity({ action: 'INQUIRY_RESPONDED', entity: 'Lead', entityId: lead.id, details: `Responded to: ${lead.name}`, adminUserId: req.admin?.id, ipAddress: req.ip })
    emitDashboardEvent('inquiry:update', updated)
    sendSuccess(res, updated, 'Response sent')
  } catch (err) { next(err) }
}

// ─── Ignore Inquiry ──────────────────────────────────────────────────────────

export async function ignore(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) { sendError(res, 'Inquiry not found', 404); return }

    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status: 'IGNORED' },
    })

    logActivity({ action: 'INQUIRY_IGNORED', entity: 'Lead', entityId: lead.id, details: `Ignored: ${lead.name}`, adminUserId: req.admin?.id, ipAddress: req.ip })
    emitDashboardEvent('inquiry:update', updated)
    sendSuccess(res, updated, 'Inquiry ignored')
  } catch (err) { next(err) }
}

// ─── Unignore Inquiry ────────────────────────────────────────────────────────

export async function unignore(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
    if (!lead) { sendError(res, 'Inquiry not found', 404); return }

    const updated = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status: 'NEW' },
    })

    logActivity({ action: 'INQUIRY_UNIGNORED', entity: 'Lead', entityId: lead.id, details: `Unignored: ${lead.name}`, adminUserId: req.admin?.id, ipAddress: req.ip })
    emitDashboardEvent('inquiry:update', updated)
    sendSuccess(res, updated, 'Inquiry restored')
  } catch (err) { next(err) }
}

// ─── Start Project from Lead ─────────────────────────────────────────────────

export async function startProject(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const {
      title, description, budget = 0, currency = 'USD', timeline, deadline,
      memberIds = [], newMembers = [],
      fiverrFeePercent = 0, zakatEnabled = false, zakatPercent = 2.5, otherCosts = [],
      amountReceived = true,
    } = req.body

    const lead = await prisma.lead.findUnique({ where: { id } })
    if (!lead) { sendError(res, 'Lead not found', 404); return }

    // 1. Find or create client from lead info (upsert to handle race conditions)
    const clientEmail = lead.email || `lead-${id}@placeholder.local`
    let client = await prisma.client.upsert({
      where: { email: clientEmail },
      update: {},
      create: {
        name: lead.name,
        email: clientEmail,
        phone: lead.phone || null,
        company: lead.company || null,
        status: 'ACTIVE',
      },
    })
    emitDashboardEvent('client:new', client)

    // 2. Create new members if any
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

    // 3. Ensure founder is included (by isFounder flag or email fallback)
    const founder = await prisma.employee.findFirst({ where: { OR: [{ isFounder: true }, { email: 'raleem811811@gmail.com' }] } })
    if (founder && !allMemberIds.includes(founder.id)) {
      allMemberIds.push(founder.id)
    }

    // 4. Create project
    const projectTitle = title || lead.service || `Project for ${lead.name}`
    const slug = projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const user = await prisma.user.findFirst()
    const project = await prisma.project.create({
      data: {
        title: projectTitle,
        slug: `${slug}-${Date.now().toString(36)}`,
        shortDescription: (description || lead.message).substring(0, 200),
        fullDescription: description || lead.message,
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
        createdById: user?.id || '',
      },
    })

    // 5. Create project assignments
    for (const memberId of allMemberIds) {
      await prisma.projectAssignment.create({
        data: { projectRef: project.id, employeeId: memberId, roleInProject: 'Developer' },
      }).catch(() => {})
    }

    // 6. Finance calculations
    const totalAmount = Number(budget) || 0
    const fiverrDeduction = totalAmount * (fiverrFeePercent / 100)
    const zakatDeduction = zakatEnabled ? totalAmount * (zakatPercent / 100) : 0
    const otherTotal = (otherCosts as any[]).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0)
    const totalDeductions = fiverrDeduction + zakatDeduction + otherTotal
    const netAmount = totalAmount - totalDeductions
    const totalMemberCount = allMemberIds.length
    const sharePerPerson = totalMemberCount > 0 ? netAmount / totalMemberCount : 0

    const projectFinance = await prisma.projectFinance.create({
      data: {
        projectRef: project.id, totalAmount, currency, fiverrFeePercent,
        zakatEnabled, zakatPercent, otherCosts: otherCosts as any,
        totalDeductions, netAmount, sharePerPerson, totalMembers: totalMemberCount,
        founderIncluded: !!founder,
      },
    })

    // 7. Create shares for each member
    for (const memberId of allMemberIds) {
      await prisma.projectShare.create({
        data: { projectFinanceId: projectFinance.id, employeeId: memberId, shareAmount: sharePerPerson },
      }).catch(() => {})
    }

    // 8. Create income in Finance
    if (totalAmount > 0) {
      await prisma.finance.create({
        data: { type: 'INCOME', amount: totalAmount, description: `Project: ${projectTitle}`, category: 'PROJECT', projectRef: project.id, received: !!amountReceived },
      })
    }

    // 9. Update client
    await prisma.client.update({
      where: { id: client.id },
      data: { status: 'ACTIVE', projects: { increment: 1 }, revenue: { increment: totalAmount } },
    })

    // 10. Update lead status to QUALIFIED (converted to project)
    await prisma.lead.update({
      where: { id },
      data: { status: 'QUALIFIED' },
    })

    // 11. Notify members
    const members = await prisma.employee.findMany({ where: { id: { in: allMemberIds } } })
    const projectFiles = await prisma.file.findMany({ where: { projectId: project.id } }).catch(() => [] as any[])
    for (const member of members) {
      const teamList = members.filter(m => m.id !== member.id).map(m => ({ name: m.name, role: m.role || 'Developer' }))
      void sendMail({
        to: member.email,
        subject: `[Techlution AI] You've been assigned to: ${projectTitle}`,
        html: memberAssignmentEmail({
          memberName: member.name, projectTitle, role: 'Developer',
          description: (description || lead.message).substring(0, 200),
          fullDescription: description || lead.message,
          budget: totalAmount, currency, deadline, timeline,
          netAmount, sharePerPerson, totalDeductions,
          fiverrFeePercent, zakatEnabled, zakatPercent,
          teamMembers: teamList, totalMembers: allMemberIds.length,
          files: projectFiles.map((f: any) => f.url || f.name),
        }),
      })
      if (member.phone) {
        void sendWhatsAppMessage(member.phone, waTemplates.projectAssigned(projectTitle, allMemberIds.length, timeline), {
          trigger: 'project_assigned', fallbackEmail: member.email,
        })
      }
    }

    // 12. Notify client
    if (client.email && !client.email.includes('@placeholder.local')) {
      void sendMail({
        to: client.email,
        subject: `[Techlution AI] Your project has been started — ${projectTitle}`,
        html: baseTemplate('Project Started', `
          <div style="display:inline-block;padding:5px 14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:999px;font-size:12px;font-weight:600;color:#34d399;margin-bottom:16px;">🚀 Project Started</div>
          <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 12px;">Your Project Has Been Started!</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 20px;">Dear ${client.name},</p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 20px;">Great news! Your project <strong style="color:#f97316;">${projectTitle}</strong> has been started. Our team of <strong style="color:#22d3ee;">${allMemberIds.length}</strong> member(s) is now working on it.</p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;">We'll keep you updated on the progress.</p>
        `, '🚀 Project Started'),
      })
    }
    if (client.phone) {
      void sendWhatsAppMessage(client.phone,
        `✅ *Project Started*\n\nProject: ${projectTitle}\nTeam: ${allMemberIds.length} members\n${timeline ? `Timeline: ${timeline} weeks` : ''}\n\nOur team is now working on your project!\n\n— Techlution AI`,
        { trigger: 'project_started', fallbackEmail: client.email }
      )
    }

    // 13. Notify admin via WhatsApp
    void notifyAdmin(waTemplates.projectCreated(projectTitle), 'project_started')

    // 14. Send detailed email to company/admin email
    void sendMail({
      to: ADMIN_EMAIL,
      subject: `[Techlution AI] New Project Started — ${projectTitle}`,
      html: baseTemplate('New Project Started', `
        <div style="display:inline-block;padding:5px 14px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:999px;font-size:12px;font-weight:600;color:#fb923c;margin-bottom:16px;">🚀 New Project from Lead</div>
        <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 20px;">Project Started from Lead</h1>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📋 Project</span><span style="color:#e2e8f0;font-weight:600;">${projectTitle}</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">👤 Client</span><span style="color:#e2e8f0;">${client.name} (${client.email})</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">💰 Budget</span><span style="color:#22d3ee;font-weight:700;">${currency} ${totalAmount.toLocaleString()}</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📊 Fiverr Fee</span><span style="color:#f87171;">-${currency} ${fiverrDeduction.toLocaleString()} (${fiverrFeePercent}%)</span></td></tr>
          ${zakatEnabled ? `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">🕌 Zakat</span><span style="color:#f87171;">-${currency} ${zakatDeduction.toLocaleString()} (${zakatPercent}%)</span></td></tr>` : ''}
          ${(otherCosts as any[]).map((c: any) => `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📎 ${c.label || 'Other'}</span><span style="color:#f87171;">-${currency} ${(Number(c.amount) || 0).toLocaleString()}</span></td></tr>`).join('')}
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">✅ Net Amount</span><span style="color:#4ade80;font-weight:700;">${currency} ${netAmount.toLocaleString()}</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">👥 Team</span><span style="color:#e2e8f0;">${members.map(m => `${m.name}${m.isFounder ? ' ⭐' : ''}`).join(', ')}</span></td></tr>
          <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">💵 Share/Person</span><span style="color:#e2e8f0;font-weight:600;">${currency} ${sharePerPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></td></tr>
          ${timeline ? `<tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">⏱️ Timeline</span><span style="color:#e2e8f0;">${timeline} weeks</span></td></tr>` : ''}
          <tr><td style="padding:14px 18px;font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📩 Lead Source</span><span style="color:#e2e8f0;">${lead.name} — ${lead.service || 'N/A'}</span></td></tr>
        </table>
      `, '🚀 Project Summary'),
    })

    emitDashboardEvent('project:update', project)
    emitDashboardEvent('finance:new', projectFinance)
    emitDashboardEvent('inquiry:update', { id, status: 'QUALIFIED' })
    logActivity({ action: 'PROJECT_STARTED_FROM_LEAD', entity: 'Project', entityId: project.id, details: `Started from lead: ${lead.name} — ${currency} ${totalAmount} — ${allMemberIds.length} members`, adminUserId: req.admin?.id, ipAddress: req.ip })

    sendSuccess(res, { project, projectFinance, client, memberCount: allMemberIds.length }, 'Project started successfully', 201)
  } catch (err) { next(err) }
}
