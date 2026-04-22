import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import {
  sendWhatsAppMessage,
  sendBulkWhatsApp,
  notifyAdmin,
  findOrCreateContact,
  saveMessage,
  waTemplates,
} from '../services/whatsapp.service'
import { emitDashboardEvent } from '../config/socket'
import logger from '../utils/logger'

const prisma = new PrismaClient()

// ─── Twilio Incoming Webhook ─────────────────────────────────────────────────

export async function incomingWebhook(req: Request, res: Response) {
  try {
    const { From, Body, MessageSid } = req.body
    if (!From || !Body) return res.status(400).json({ error: 'Missing From or Body' })

    // Strip "whatsapp:" prefix
    const phone = From.replace('whatsapp:', '')
    const contact = await findOrCreateContact(phone)
    if (!contact) return res.status(400).json({ error: 'Invalid phone' })

    // Save message
    const { message, conversation } = await saveMessage(contact.id, Body, 'INCOMING', MessageSid)

    // Emit real-time event to admin dashboard
    emitDashboardEvent('dashboard:refresh', {
      type: 'whatsapp:incoming',
      contactId: contact.id,
      contactName: contact.name || phone,
      message: Body.substring(0, 100),
    })

    // Notify admin
    await notifyAdmin(
      `📲 *New WhatsApp Message*\n\nFrom: ${contact.name || phone}\n💬 ${Body.substring(0, 200)}`,
      'incoming_message'
    )

    // Return TwiML empty response (don't auto-reply from webhook by default)
    res.set('Content-Type', 'text/xml')
    res.send('<Response></Response>')
  } catch (err) {
    logger.error('WhatsApp webhook error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// ─── Twilio Status Callback ──────────────────────────────────────────────────

export async function statusCallback(req: Request, res: Response) {
  try {
    const { MessageSid, MessageStatus } = req.body
    if (!MessageSid) return res.sendStatus(200)

    const statusMap: Record<string, string> = {
      queued: 'QUEUED',
      sent: 'SENT',
      delivered: 'DELIVERED',
      read: 'READ',
      failed: 'FAILED',
      undelivered: 'FAILED',
    }

    const status = statusMap[MessageStatus] || 'SENT'

    // Update message status
    await prisma.whatsAppMessage.updateMany({
      where: { twilioSid: MessageSid },
      data: { status: status as any },
    })

    // Update log status
    await prisma.whatsAppLog.updateMany({
      where: { twilioSid: MessageSid },
      data: { status: status as any },
    })

    res.sendStatus(200)
  } catch (err) {
    logger.error('Status callback error:', err)
    res.sendStatus(200)
  }
}

// ─── Send Message (Admin Panel) ──────────────────────────────────────────────

export async function sendMessage(req: Request, res: Response) {
  try {
    const { contactId, body } = req.body
    if (!contactId || !body) return res.status(400).json({ error: 'contactId and body required' })

    const contact = await prisma.whatsAppContact.findUnique({ where: { id: contactId } })
    if (!contact) return res.status(404).json({ error: 'Contact not found' })

    const result = await sendWhatsAppMessage(contact.phone, body)
    if (result.success) {
      await saveMessage(contactId, body, 'OUTGOING', result.sid)
    }

    res.json({ success: result.success, sid: result.sid, error: result.error })
  } catch (err) {
    logger.error('Send message error:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

// ─── Send to Phone (Quick Send) ─────────────────────────────────────────────

export async function sendToPhone(req: Request, res: Response) {
  try {
    const { phone, body, trigger } = req.body
    if (!phone || !body) return res.status(400).json({ error: 'phone and body required' })

    const result = await sendWhatsAppMessage(phone, body, { trigger })
    res.json({ success: result.success, sid: result.sid, error: result.error })
  } catch (err) {
    logger.error('Send to phone error:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

// ─── Broadcast ───────────────────────────────────────────────────────────────

export async function broadcast(req: Request, res: Response) {
  try {
    const { subject, message, tags, contactIds } = req.body
    if (!message) return res.status(400).json({ error: 'message required' })

    let contacts: any[]

    if (contactIds?.length) {
      contacts = await prisma.whatsAppContact.findMany({
        where: { id: { in: contactIds } },
      })
    } else if (tags?.length) {
      contacts = await prisma.whatsAppContact.findMany({
        where: { tags: { hasSome: tags } },
      })
    } else {
      contacts = await prisma.whatsAppContact.findMany()
    }

    if (contacts.length === 0) return res.json({ sent: 0, failed: 0, total: 0 })

    const body = waTemplates.broadcast(subject || 'Announcement', message)
    const recipients = contacts.map((c: any) => ({ phone: c.phone }))
    const result = await sendBulkWhatsApp(recipients, body, 'broadcast')

    res.json({ ...result, total: contacts.length })
  } catch (err) {
    logger.error('Broadcast error:', err)
    res.status(500).json({ error: 'Broadcast failed' })
  }
}

// ─── Contacts CRUD ───────────────────────────────────────────────────────────

export async function listContacts(req: Request, res: Response) {
  try {
    const { search, tag, page = '1', limit = '50' } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search) } },
      ]
    }
    if (tag) where.tags = { has: String(tag) }

    const [contacts, total] = await Promise.all([
      prisma.whatsAppContact.findMany({
        where,
        include: {
          linkedClient: { select: { id: true, name: true, email: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip,
        take: Number(limit),
      }),
      prisma.whatsAppContact.count({ where }),
    ])

    res.json({ data: contacts, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    logger.error('List contacts error:', err)
    res.status(500).json({ error: 'Failed to list contacts' })
  }
}

export async function getContact(req: Request, res: Response) {
  try {
    const contact = await prisma.whatsAppContact.findUnique({
      where: { id: req.params.id },
      include: {
        linkedClient: true,
        conversations: { where: { status: 'OPEN' }, take: 1 },
      },
    })
    if (!contact) return res.status(404).json({ error: 'Contact not found' })
    res.json({ data: contact })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get contact' })
  }
}

export async function updateContact(req: Request, res: Response) {
  try {
    const { name, tags, notes, linkedClientId } = req.body
    const contact = await prisma.whatsAppContact.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(tags !== undefined && { tags }),
        ...(notes !== undefined && { notes }),
        ...(linkedClientId !== undefined && { linkedClientId }),
      },
    })
    res.json({ data: contact })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact' })
  }
}

export async function deleteContact(req: Request, res: Response) {
  try {
    await prisma.whatsAppContact.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact' })
  }
}

// ─── Conversations & Messages ────────────────────────────────────────────────

export async function getConversation(req: Request, res: Response) {
  try {
    const { contactId } = req.params
    const { page = '1', limit = '50' } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const messages = await prisma.whatsAppMessage.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    })

    const total = await prisma.whatsAppMessage.count({ where: { contactId } })

    res.json({ data: messages.reverse(), total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get conversation' })
  }
}

export async function closeConversation(req: Request, res: Response) {
  try {
    const convo = await prisma.whatsAppConversation.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED', closedAt: new Date() },
    })
    res.json({ data: convo })
  } catch (err) {
    res.status(500).json({ error: 'Failed to close conversation' })
  }
}

// ─── Logs ────────────────────────────────────────────────────────────────────

export async function getLogs(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50' } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const [logs, total] = await Promise.all([
      prisma.whatsAppLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.whatsAppLog.count(),
    ])

    res.json({ data: logs, total })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get logs' })
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getStats(req: Request, res: Response) {
  try {
    const [totalContacts, totalMessages, openConversations, sentToday] = await Promise.all([
      prisma.whatsAppContact.count(),
      prisma.whatsAppMessage.count(),
      prisma.whatsAppConversation.count({ where: { status: 'OPEN' } }),
      prisma.whatsAppLog.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: 'SENT',
        },
      }),
    ])

    const tagCounts = await prisma.whatsAppContact.groupBy({
      by: ['tags'],
      _count: true,
    })

    res.json({
      data: {
        totalContacts,
        totalMessages,
        openConversations,
        sentToday,
        tagCounts,
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats' })
  }
}

// ─── Convert Contact to Client ───────────────────────────────────────────────

export async function convertToClient(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { email, company, industry } = req.body

    const contact = await prisma.whatsAppContact.findUnique({ where: { id } })
    if (!contact) return res.status(404).json({ error: 'Contact not found' })
    if (contact.linkedClientId) return res.status(400).json({ error: 'Already linked to a client' })

    if (!email) return res.status(400).json({ error: 'Email required to create client' })

    const client = await prisma.client.create({
      data: {
        name: contact.name || 'WhatsApp Contact',
        email,
        phone: contact.phone,
        company,
        industry,
        status: 'PROSPECT',
      },
    })

    await prisma.whatsAppContact.update({
      where: { id },
      data: { linkedClientId: client.id, tags: { set: ['CLIENT'] } },
    })

    emitDashboardEvent('client:new', client)

    res.json({ data: client })
  } catch (err: any) {
    if (err?.code === 'P2002') return res.status(400).json({ error: 'Client with this email already exists' })
    res.status(500).json({ error: 'Failed to convert to client' })
  }
}
