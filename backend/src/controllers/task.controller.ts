import { Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AdminRequest } from '../middlewares/admin.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { emitDashboardEvent } from '../config/socket'
import { logActivity } from '../services/activity.service'
import { sendMail, memberAssignmentEmail } from '../services/email.service'
import { sendWhatsAppMessage } from '../services/whatsapp.service'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'raleem811811@gmail.com'

// ─── List tasks for a project ────────────────────────────────────────────────

export async function list(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { assignee: { select: { id: true, name: true, email: true, role: true, isFounder: true, phone: true } } },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    })
    sendSuccess(res, tasks)
  } catch (err) { next(err) }
}

// ─── Create task ─────────────────────────────────────────────────────────────

export async function create(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params
    const { title, description, priority, assigneeId, dueDate } = req.body
    if (!title) { sendError(res, 'Title is required', 400); return }

    const task = await prisma.task.create({
      data: {
        projectId, title, description, priority: priority || 'MEDIUM',
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { assignee: { select: { id: true, name: true, email: true, role: true, isFounder: true, phone: true } }, project: { select: { title: true } } },
    })

    // Notify assignee
    if (task.assignee) {
      const project = task.project
      void sendMail({
        to: task.assignee.email,
        subject: `[Techlution AI] New Task Assigned — ${task.title}`,
        html: taskAssignmentEmail({
          memberName: task.assignee.name,
          taskTitle: task.title,
          taskDescription: description || '',
          projectTitle: project.title,
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : null,
        }),
      })
      if (task.assignee.phone) {
        void sendWhatsAppMessage(task.assignee.phone,
          `📋 *New Task Assigned*\n\nTask: ${task.title}\nProject: ${project.title}\nPriority: ${priority || 'MEDIUM'}${dueDate ? `\nDue: ${new Date(dueDate).toLocaleDateString()}` : ''}\n\n${description || ''}\n\n— Techlution AI`,
          { trigger: 'task_assigned', fallbackEmail: task.assignee.email }
        )
      }
    }

    emitDashboardEvent('task:new', task)
    logActivity({ action: 'TASK_CREATED', entity: 'Task', entityId: task.id, details: `Task: ${title} (Project: ${task.project.title})`, adminUserId: req.admin?.id, ipAddress: req.ip })
    sendSuccess(res, task, 'Task created', 201)
  } catch (err) { next(err) }
}

// ─── Update task ─────────────────────────────────────────────────────────────

export async function update(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params
    const { title, description, status, priority, assigneeId, dueDate } = req.body

    const existing = await prisma.task.findUnique({ where: { id: taskId }, include: { assignee: true } })
    if (!existing) { sendError(res, 'Task not found', 404); return }

    const data: any = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (status !== undefined) {
      data.status = status
      if (status === 'DONE') data.completedAt = new Date()
      else data.completedAt = null
    }
    if (priority !== undefined) data.priority = priority
    if (assigneeId !== undefined) data.assigneeId = assigneeId || null
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null

    const task = await prisma.task.update({
      where: { id: taskId },
      data,
      include: { assignee: { select: { id: true, name: true, email: true, role: true, isFounder: true, phone: true } }, project: { select: { title: true } } },
    })

    // If assignee changed, notify new assignee
    if (assigneeId && assigneeId !== existing.assigneeId && task.assignee) {
      void sendMail({
        to: task.assignee.email,
        subject: `[Techlution AI] Task Assigned — ${task.title}`,
        html: taskAssignmentEmail({
          memberName: task.assignee.name,
          taskTitle: task.title,
          taskDescription: task.description || '',
          projectTitle: task.project.title,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.toLocaleDateString() : null,
        }),
      })
    }

    emitDashboardEvent('task:update', task)
    sendSuccess(res, task, 'Task updated')
  } catch (err) { next(err) }
}

// ─── Delete task ─────────────────────────────────────────────────────────────

export async function remove(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } })
    sendSuccess(res, null, 'Task deleted')
  } catch (err) { next(err) }
}

// ─── Get tasks for an employee ───────────────────────────────────────────────

export async function getEmployeeTasks(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.params.id },
      include: { project: { select: { id: true, title: true, status: true } } },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }],
    })
    sendSuccess(res, tasks)
  } catch (err) { next(err) }
}

// ─── Task Assignment Email Template ──────────────────────────────────────────

function taskAssignmentEmail(data: { memberName: string; taskTitle: string; taskDescription: string; projectTitle: string; priority: string; dueDate: string | null }): string {
  const year = new Date().getFullYear()
  const priorityColors: Record<string, string> = { LOW: '#94a3b8', MEDIUM: '#f97316', HIGH: '#f43f5e', URGENT: '#ef4444' }
  const pColor = priorityColors[data.priority] || '#f97316'
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#070b14;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
<div style="max-width:640px;margin:0 auto;padding:32px 16px;">
<div style="background:linear-gradient(145deg,#0f172a,#1a2332);border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.4);">
  <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:28px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td><div style="font-size:24px;font-weight:800;"><span style="color:#f97316;">Techlution</span><span style="color:#e2e8f0;"> AI</span></div>
      <div style="font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Task Assignment</div></td>
      <td style="text-align:right;"><div style="display:inline-block;padding:5px 14px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:999px;font-size:12px;font-weight:600;color:#fb923c;">📋 New Task</div></td>
    </tr></table>
  </div>
  <div style="padding:32px;">
    <p style="font-size:15px;color:#94a3b8;margin:0 0 8px;">Hi <strong style="color:#fff;">${data.memberName}</strong>,</p>
    <p style="font-size:14px;color:#94a3b8;margin:0 0 20px;">You've been assigned a new task on project <strong style="color:#22d3ee;">${data.projectTitle}</strong></p>
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
      <div style="padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.04);">
        <div style="font-size:18px;font-weight:800;color:#fff;">📋 ${data.taskTitle}</div>
      </div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">🎯 Priority</span><span style="color:${pColor};font-weight:700;padding:2px 10px;background:${pColor}15;border:1px solid ${pColor}30;border-radius:999px;font-size:11px;">${data.priority}</span></td></tr>
        ${data.dueDate ? `<tr><td style="padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📅 Due Date</span><span style="color:#e2e8f0;font-weight:600;">${data.dueDate}</span></td></tr>` : ''}
        <tr><td style="padding:12px 18px;font-size:13px;"><span style="color:#64748b;display:inline-block;width:120px;">📂 Project</span><span style="color:#22d3ee;font-weight:600;">${data.projectTitle}</span></td></tr>
      </table>
    </div>
    ${data.taskDescription ? `<div style="margin-top:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;">
      <p style="font-size:12px;color:#64748b;margin:0 0 8px;font-weight:600;">DESCRIPTION</p>
      <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0;">${data.taskDescription}</p>
    </div>` : ''}
    <p style="font-size:13px;color:#64748b;margin:20px 0 0;line-height:1.6;">Please review and start working on this task. If you have any questions, reach out to the team lead.</p>
  </div>
  <div style="background:#0b1120;padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);">
    <div style="text-align:center;margin-bottom:12px;"><span style="font-size:16px;font-weight:800;color:#f97316;">Techlution</span><span style="font-size:16px;font-weight:800;color:#94a3b8;"> AI</span></div>
    <div style="text-align:center;font-size:12px;color:#64748b;margin-bottom:8px;">Innovate &bull; Automate &bull; Elevate</div>
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:12px 0;"></div>
    <div style="text-align:center;font-size:11px;color:#475569;">📍 City Park Road, Islamabad, Pakistan &bull; 📞 +92 315 1664843 &bull; ✉️ raleem811811@gmail.com</div>
    <div style="text-align:center;font-size:10px;color:#334155;margin-top:8px;">&copy; ${year} Techlution AI. All rights reserved.</div>
  </div>
</div></div></body></html>`
}
