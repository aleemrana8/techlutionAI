import * as contactRepo from '../repositories/contact.repository'
import { sendMail, contactAdminEmail, contactConfirmationEmail, projectRequestAdminEmail, projectConfirmationEmail } from './email.service'
import { notifyAdmin, findOrCreateContact, waTemplates } from './whatsapp.service'
import { LeadStatus } from '@prisma/client'
import { getPagination, buildPaginationMeta } from '../types'

export async function submitContact(input: {
  name: string
  email: string
  phone?: string
  company?: string
  service?: string
  message: string
  ipAddress?: string
  userAgent?: string
  attachments?: Express.Multer.File[]
}) {
  const { attachments: files, ...leadData } = input
  const lead = await contactRepo.createLead({ ...leadData, type: 'INQUIRY' })
  const emailAttachments = (files || []).map(f => ({ filename: f.originalname, path: f.path }))

  // Admin notification (fire-and-forget)
  void sendMail({
    to: process.env.ADMIN_EMAIL!,
    subject: `[Techlution AI] � Client Inquiry – ${input.service || 'General'} – ${input.name}`,
    html: contactAdminEmail(input),
    attachments: emailAttachments,
  })

  // Client confirmation (fire-and-forget)
  void sendMail({
    to: input.email,
    subject: 'Thank you for reaching out – Techlution AI',
    html: contactConfirmationEmail(input.name),
  })

  // WhatsApp: notify admin about new inquiry
  void notifyAdmin(waTemplates.newInquiry(input.name, input.message), 'new_inquiry')

  // WhatsApp: create CRM contact if phone provided
  if (input.phone) void findOrCreateContact(input.phone, input.name)

  return lead
}

export async function submitProjectRequest(input: {
  name: string
  email?: string
  phone?: string
  service: string
  budget?: string
  timeline?: string
  message: string
  ipAddress?: string
  userAgent?: string
  attachments?: Express.Multer.File[]
}) {
  const { attachments: files, budget, timeline, ...rest } = input
  const lead = await contactRepo.createLead({
    name: rest.name,
    email: rest.email || '',
    phone: rest.phone,
    service: rest.service,
    message: rest.message,
    type: 'PROPOSAL',
    budget: budget || null,
    timeline: timeline || null,
    ipAddress: rest.ipAddress,
    userAgent: rest.userAgent,
  })

  const emailAttachments = (files || []).map(f => ({ filename: f.originalname, path: f.path }))

  // Admin gets project-style email with attachments
  void sendMail({
    to: process.env.ADMIN_EMAIL!,
    subject: `[Techlution AI] 🚀 Project Proposal – ${input.service} – ${input.name}`,
    html: projectRequestAdminEmail(input),
    attachments: emailAttachments,
  })

  // Client gets project confirmation with details
  if (input.email) {
    void sendMail({
      to: input.email,
      subject: 'Your project request has been received – Techlution AI',
      html: projectConfirmationEmail(input.name, input.service, input.budget, input.timeline),
    })
  }

  // WhatsApp: notify admin about project proposal
  void notifyAdmin(
    `🚀 *New Project Proposal*\n\n👤 ${input.name}\n📋 Service: ${input.service}\n💰 Budget: ${input.budget || 'N/A'}\n⏰ Timeline: ${input.timeline || 'N/A'}\n\n💬 ${input.message.substring(0, 200)}`,
    'new_project_request'
  )

  if (input.phone) void findOrCreateContact(input.phone, input.name)

  return lead
}

export async function listLeads(query: { page?: string; limit?: string; status?: string }) {
  const { skip, take, page, limit } = getPagination(query)
  const { leads, total } = await contactRepo.listLeads(skip, take, query.status as LeadStatus | undefined)
  return { leads, meta: buildPaginationMeta(total, page, limit) }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return contactRepo.updateLeadStatus(id, status)
}
