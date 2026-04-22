import { Router } from 'express'
import { requireAdmin, requirePermission, requireRoles } from '../middlewares/admin.middleware'
import * as dashboardCtrl from '../controllers/dashboard.controller'
import * as visitorCtrl from '../controllers/visitor.controller'
import * as leadCtrl from '../controllers/lead.controller'
import * as clientCtrl from '../controllers/client.controller'
import * as employeeCtrl from '../controllers/employee.controller'
import * as financeCtrl from '../controllers/finance.controller'
import * as analyticsCtrl from '../controllers/analytics.controller'
import * as adminUserCtrl from '../controllers/adminUser.controller'
import * as pfCtrl from '../controllers/projectFinance.controller'
import * as reportCtrl from '../controllers/report.controller'
import * as proposalCtrl from '../controllers/proposal.controller'
import * as waCtrl from '../controllers/whatsapp.controller'
import * as taskCtrl from '../controllers/task.controller'
import prisma from '../config/database'
import { sendSuccess, sendError } from '../utils/response'
import { sendMail, memberAssignmentEmail } from '../services/email.service'
import { sendWhatsAppMessage, waTemplates } from '../services/whatsapp.service'
import { emitDashboardEvent } from '../config/socket'

const router = Router()

// ─── Public admin auth (no token required) ────────────────────────────────────
router.post('/login', adminUserCtrl.login)

// All routes below require authentication
router.use(requireAdmin)

// ─── Dashboard Summary ────────────────────────────────────────────────────────
router.get('/dashboard', adminUserCtrl.dashboardSummary)
router.get('/dashboard/summary', adminUserCtrl.dashboardSummary)
router.get('/dashboard/trends', adminUserCtrl.dashboardTrends)

// ─── Admin Users (SUPER_ADMIN only) ──────────────────────────────────────────
router.get('/users', requireRoles('SUPER_ADMIN', 'ADMIN'), adminUserCtrl.list)
router.post('/users', requireRoles('SUPER_ADMIN'), adminUserCtrl.create)
router.put('/users/:id', requireRoles('SUPER_ADMIN'), adminUserCtrl.update)
router.delete('/users/:id', requireRoles('SUPER_ADMIN'), adminUserCtrl.remove)

// ─── Activity Logs (ADMIN only) ──────────────────────────────────────────────
router.get('/logs', requirePermission('logs'), adminUserCtrl.getLogs)

// ─── Visitors ─────────────────────────────────────────────────────────────────
router.get('/visitors', requirePermission('visitors', 'read'), visitorCtrl.list)
router.get('/visitors/stats', requirePermission('visitors', 'read'), visitorCtrl.stats)
router.post('/visitors', requirePermission('visitors', 'write'), visitorCtrl.create)

// ─── Inquiries ────────────────────────────────────────────────────────────────
router.get('/inquiries', requirePermission('inquiries', 'read'), leadCtrl.list)
router.get('/inquiries/stats', requirePermission('inquiries', 'read'), leadCtrl.stats)
router.get('/inquiries/:id', requirePermission('inquiries', 'read'), leadCtrl.getById)
router.post('/inquiries', requirePermission('inquiries', 'write'), leadCtrl.create)
router.put('/inquiries/:id', requirePermission('inquiries', 'write'), leadCtrl.update)
router.put('/inquiries/:id/respond', requirePermission('inquiries', 'write'), leadCtrl.respond)
router.put('/inquiries/:id/ignore', requirePermission('inquiries', 'write'), leadCtrl.ignore)
router.put('/inquiries/:id/unignore', requirePermission('inquiries', 'write'), leadCtrl.unignore)
router.post('/inquiries/:id/start-project', requirePermission('inquiries', 'write'), leadCtrl.startProject)
router.delete('/inquiries/:id', requirePermission('inquiries', 'write'), leadCtrl.remove)

// ─── Clients ──────────────────────────────────────────────────────────────────
router.get('/clients', requirePermission('clients', 'read'), clientCtrl.list)
router.get('/clients/stats', requirePermission('clients', 'read'), clientCtrl.stats)
router.get('/clients/:id', requirePermission('clients', 'read'), clientCtrl.getById)
router.post('/clients', requirePermission('clients', 'write'), clientCtrl.create)
router.put('/clients/:id', requirePermission('clients', 'write'), clientCtrl.update)
router.delete('/clients/:id', requirePermission('clients', 'write'), clientCtrl.remove)

// ─── Employees (Members) ─────────────────────────────────────────────────────
router.get('/employees', requirePermission('employees', 'read'), employeeCtrl.list)
router.get('/employees/stats', requirePermission('employees', 'read'), employeeCtrl.stats)
router.get('/employees/:id', requirePermission('employees', 'read'), employeeCtrl.getById)
router.get('/employees/:id/assignments', requirePermission('employees', 'read'), employeeCtrl.getAssignments)
router.get('/employees/:id/tasks', requirePermission('employees', 'read'), taskCtrl.getEmployeeTasks)
router.post('/employees', requirePermission('employees', 'write'), employeeCtrl.create)
router.put('/employees/:id', requirePermission('employees', 'write'), employeeCtrl.update)
router.delete('/employees/:id', requirePermission('employees', 'write'), employeeCtrl.remove)

// ─── Finance ──────────────────────────────────────────────────────────────────
router.get('/finance', requirePermission('finance', 'read'), financeCtrl.list)
router.get('/finance/summary', requirePermission('finance', 'read'), financeCtrl.summary)
router.get('/finance/:id', requirePermission('finance', 'read'), financeCtrl.getById)
router.post('/finance', requirePermission('finance', 'write'), financeCtrl.create)
router.put('/finance/:id', requirePermission('finance', 'write'), financeCtrl.update)
router.delete('/finance/:id', requirePermission('finance', 'write'), financeCtrl.remove)

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/analytics/overview', requirePermission('analytics'), analyticsCtrl.overview)
router.get('/analytics/inquiries', requirePermission('analytics'), analyticsCtrl.leadAnalytics)
router.get('/analytics/visitors', requirePermission('analytics'), analyticsCtrl.visitorAnalytics)
router.get('/analytics/finance', requirePermission('analytics'), analyticsCtrl.financeAnalytics)
router.get('/analytics/projects', requirePermission('analytics'), analyticsCtrl.projectAnalytics)
router.get('/analytics/hr', requirePermission('analytics'), analyticsCtrl.hrAnalytics)
router.get('/analytics/insights', analyticsCtrl.aiInsights)
router.get('/analytics/recommendations', analyticsCtrl.recommendations)

// ─── Project Member Assignment ───────────────────────────────────────────────
router.post('/projects/:id/assign-member', requirePermission('employees', 'write'), async (req: any, res, next) => {
  try {
    const { id } = req.params
    const { employeeId } = req.body
    if (!employeeId) { sendError(res, 'employeeId is required', 400); return }
    const existing = await prisma.projectAssignment.findFirst({ where: { projectRef: id, employeeId } })
    if (existing) { sendError(res, 'Member already assigned', 400); return }
    const assignment = await prisma.projectAssignment.create({
      data: { projectRef: id, employeeId, roleInProject: req.body.role || 'Developer' },
      include: { employee: { select: { id: true, name: true, email: true, role: true, department: true, isFounder: true, phone: true } } },
    })
    // Notify member
    const project = await prisma.project.findUnique({ where: { id }, include: { files: true, assignments: { include: { employee: { select: { name: true, role: true } } } } } })
    const finance = await prisma.projectFinance.findUnique({ where: { projectRef: id } })
    if (project && assignment.employee) {
      const teamList = project.assignments.filter(a => a.employee.name !== assignment.employee.name).map(a => ({ name: a.employee.name, role: a.roleInProject || a.employee.role || 'Member' }))
      void sendMail({ to: assignment.employee.email, subject: `[Techlution AI] You've been assigned to: ${project.title}`, html: memberAssignmentEmail({
        memberName: assignment.employee.name, projectTitle: project.title, role: assignment.roleInProject || undefined,
        description: project.shortDescription || undefined, fullDescription: project.fullDescription || undefined,
        category: project.category || undefined,
        budget: finance?.totalAmount || undefined, currency: finance?.currency || undefined,
        netAmount: finance?.netAmount || undefined, sharePerPerson: finance?.sharePerPerson || undefined,
        totalDeductions: finance?.totalDeductions || undefined,
        fiverrFeePercent: finance?.fiverrFeePercent || undefined, zakatEnabled: finance?.zakatEnabled || undefined, zakatPercent: finance?.zakatPercent || undefined,
        deadline: project.deadline || undefined, timeline: project.durationWeeks || undefined,
        teamMembers: teamList, totalMembers: project.assignments.length,
        files: project.files?.map((f: any) => f.url || f.name) || undefined,
      }) })
      if (assignment.employee.phone) void sendWhatsAppMessage(assignment.employee.phone, waTemplates.projectAssigned(project.title, 0, undefined), { trigger: 'project_assigned', fallbackEmail: assignment.employee.email })
    }
    emitDashboardEvent('project:update', { id })
    sendSuccess(res, assignment, 'Member assigned', 201)
  } catch (err) { next(err) }
})

router.delete('/projects/:id/remove-member/:employeeId', requirePermission('employees', 'write'), async (req: any, res, next) => {
  try {
    const { id, employeeId } = req.params
    await prisma.projectAssignment.deleteMany({ where: { projectRef: id, employeeId } })
    emitDashboardEvent('project:update', { id })
    sendSuccess(res, null, 'Member removed from project')
  } catch (err) { next(err) }
})

// ─── Project Tasks ───────────────────────────────────────────────────────────
router.get('/projects/:projectId/tasks', requirePermission('employees', 'read'), taskCtrl.list)
router.post('/projects/:projectId/tasks', requirePermission('employees', 'write'), taskCtrl.create)
router.put('/tasks/:taskId', requirePermission('employees', 'write'), taskCtrl.update)
router.delete('/tasks/:taskId', requirePermission('employees', 'write'), taskCtrl.remove)

// ─── Project Finance (Cost Sharing) ──────────────────────────────────────────
router.post('/project-finance/calculate', requirePermission('finance', 'write'), pfCtrl.calculate)
router.get('/project-finance/:projectRef', requirePermission('finance', 'read'), pfCtrl.getFinance)
router.get('/project-finance/:projectRef/assignments', requirePermission('finance', 'read'), pfCtrl.getAssignments)
router.post('/project-finance/notify', requirePermission('finance', 'write'), pfCtrl.notifyTeam)
router.put('/project-finance/shares/:shareId/pay', requirePermission('finance', 'write'), pfCtrl.markPaid)

// ─── Reports ─────────────────────────────────────────────────────────────────
router.get('/reports/download', reportCtrl.downloadReport)
router.post('/reports/generate', reportCtrl.generateReport)
router.post('/reports/email', reportCtrl.emailReport)
router.get('/reports/email-logs', reportCtrl.getEmailLogs)
// ─── Proposals ───────────────────────────────────────────────────────────────
router.get('/proposals', requirePermission('inquiries', 'read'), proposalCtrl.list)
router.get('/proposals/stats', requirePermission('inquiries', 'read'), proposalCtrl.stats)
router.get('/proposals/:id', requirePermission('inquiries', 'read'), proposalCtrl.getById)
router.post('/proposals', requirePermission('inquiries', 'write'), proposalCtrl.create)
router.put('/proposals/:id/status', requirePermission('inquiries', 'write'), proposalCtrl.updateStatus)
router.post('/proposals/:id/start-project', requirePermission('inquiries', 'write'), proposalCtrl.startProject)
router.delete('/proposals/:id', requirePermission('inquiries', 'write'), proposalCtrl.remove)

// ─── WhatsApp CRM ────────────────────────────────────────────────────────────
router.get('/whatsapp/stats', waCtrl.getStats)
router.get('/whatsapp/contacts', waCtrl.listContacts)
router.get('/whatsapp/contacts/:id', waCtrl.getContact)
router.put('/whatsapp/contacts/:id', waCtrl.updateContact)
router.delete('/whatsapp/contacts/:id', waCtrl.deleteContact)
router.post('/whatsapp/contacts/:id/convert', waCtrl.convertToClient)
router.get('/whatsapp/conversations/:contactId', waCtrl.getConversation)
router.put('/whatsapp/conversations/:id/close', waCtrl.closeConversation)
router.post('/whatsapp/send', waCtrl.sendMessage)
router.post('/whatsapp/send-phone', waCtrl.sendToPhone)
router.post('/whatsapp/broadcast', requireRoles('SUPER_ADMIN', 'ADMIN'), waCtrl.broadcast)
router.get('/whatsapp/logs', waCtrl.getLogs)

export default router
