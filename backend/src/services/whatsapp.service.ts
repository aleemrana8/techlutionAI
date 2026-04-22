import Twilio from 'twilio'
import { PrismaClient } from '@prisma/client'
import logger from '../utils/logger'
import { sendMail, baseTemplate } from './email.service'

const prisma = new PrismaClient()

// ─── WhatsApp Official Cloud API (Meta) ──────────────────────────────────────
// https://developers.facebook.com → WhatsApp → API Setup
const metaPhoneNumberId = process.env.WA_PHONE_NUMBER_ID
const metaAccessToken = process.env.WA_ACCESS_TOKEN
const metaApiVersion = process.env.WA_API_VERSION || 'v21.0'

// ─── Green API (FREE — secondary provider) ───────────────────────────────────
const greenApiInstance = process.env.GREENAPI_INSTANCE_ID
const greenApiToken = process.env.GREENAPI_API_TOKEN

// ─── Twilio Client ───────────────────────────────────────────────────────────
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'
const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER

// ─── CallMeBot (free fallback) ──────────────────────────────────────────────
const callmebotApiKey = process.env.CALLMEBOT_API_KEY
const callmebotPhone = process.env.CALLMEBOT_PHONE || adminNumber

let client: Twilio.Twilio | null = null

function getTwilioClient(): Twilio.Twilio | null {
  if (!accountSid || !authToken) {
    return null
  }
  if (!client) {
    client = Twilio(accountSid, authToken)
  }
  return client
}

// ─── WhatsApp Official Cloud API (Meta) Provider ────────────────────────────

async function sendViaMetaApi(phone: string, text: string): Promise<SendResult> {
  if (!metaPhoneNumberId || !metaAccessToken) {
    return { success: false, error: 'Meta WhatsApp API not configured' }
  }

  // Meta expects phone number with country code, no + prefix, no spaces
  const cleanPhone = phone.replace(/^\+/, '').replace(/[\s\-\(\)]/g, '')
  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, error: 'Invalid phone number for Meta API' }
  }

  const url = `https://graph.facebook.com/${metaApiVersion}/${metaPhoneNumberId}/messages`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${metaAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
      signal: AbortSignal.timeout(15000),
    })

    const data = await res.json() as any
    if (res.ok && data.messages?.[0]?.id) {
      logger.info(`Meta WhatsApp sent to ${cleanPhone} (${data.messages[0].id})`)
      return { success: true, sid: data.messages[0].id }
    }

    const errMsg = data.error?.message || JSON.stringify(data)
    logger.error(`Meta WhatsApp API failed: ${errMsg}`)
    return { success: false, error: `Meta API: ${errMsg}` }
  } catch (err: any) {
    logger.error(`Meta WhatsApp API error: ${err.message}`)
    return { success: false, error: err.message }
  }
}

// ─── Green API Provider ──────────────────────────────────────────────────────

async function sendViaGreenApi(phone: string, text: string): Promise<SendResult> {
  if (!greenApiInstance || !greenApiToken) {
    return { success: false, error: 'Green API not configured' }
  }

  // Green API wants phone without + and with @c.us suffix
  const cleanPhone = phone.replace(/^\+/, '').replace(/[\s\-\(\)]/g, '')
  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, error: 'Invalid phone number for Green API' }
  }

  const chatId = `${cleanPhone}@c.us`
  const url = `https://api.green-api.com/waInstance${greenApiInstance}/sendMessage/${greenApiToken}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message: text }),
      signal: AbortSignal.timeout(15000),
    })

    const data = await res.json() as any
    if (res.ok && data.idMessage) {
      logger.info(`Green API WhatsApp sent to ${cleanPhone} (${data.idMessage})`)
      return { success: true, sid: data.idMessage }
    }

    logger.error(`Green API failed: ${JSON.stringify(data)}`)
    return { success: false, error: `Green API: ${data.message || JSON.stringify(data)}` }
  } catch (err: any) {
    logger.error(`Green API error: ${err.message}`)
    return { success: false, error: err.message }
  }
}

// ─── CallMeBot Provider ─────────────────────────────────────────────────────

async function sendViaCallMeBot(phone: string, text: string): Promise<SendResult> {
  if (!callmebotApiKey) {
    return { success: false, error: 'CallMeBot API key not configured' }
  }
  const targetPhone = phone || callmebotPhone
  if (!targetPhone) return { success: false, error: 'No phone number' }

  const cleanPhone = targetPhone.replace(/^\+/, '')
  const encodedText = encodeURIComponent(text)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${callmebotApiKey}`

  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15000) })
    if (res.ok) {
      logger.info(`CallMeBot WhatsApp sent to ${cleanPhone}`)
      return { success: true, sid: `callmebot-${Date.now()}` }
    }
    const body = await res.text()
    logger.error(`CallMeBot failed (${res.status}): ${body}`)
    return { success: false, error: `CallMeBot HTTP ${res.status}: ${body}` }
  } catch (err: any) {
    logger.error(`CallMeBot error: ${err.message}`)
    return { success: false, error: err.message }
  }
}

// ─── Core Send ───────────────────────────────────────────────────────────────

interface SendResult {
  success: boolean
  sid?: string
  error?: string
}

/**
 * Send a WhatsApp message via Twilio.
 * Retries once on failure, then falls back to email if provided.
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string,
  options?: { trigger?: string; fallbackEmail?: string; fallbackSubject?: string }
): Promise<SendResult> {

  // ─── Priority chain: Meta Official → Green API → Twilio → CallMeBot → Email ─

  // 1) WhatsApp Official Cloud API (Meta)
  if (metaPhoneNumberId && metaAccessToken) {
    const result = await sendViaMetaApi(to, body)
    if (result.success) {
      await logMessage(to, body, result.sid, options?.trigger)
      return result
    }
    logger.warn(`Meta API failed for ${to}: ${result.error}`)
  }

  // 2) Green API (free)
  if (greenApiInstance && greenApiToken) {
    const result = await sendViaGreenApi(to, body)
    if (result.success) {
      await logMessage(to, body, result.sid, options?.trigger)
      return result
    }
    logger.warn(`Green API failed for ${to}: ${result.error}`)
  }

  // 2) Twilio
  const tw = getTwilioClient()
  if (tw) {
    const formatted = formatPhone(to)
    if (formatted) {
      let result = await attemptSend(tw, formatted, body)
      if (result.success) {
        await logMessage(formatted, body, result.sid!, options?.trigger)
        return result
      }
      // Retry once
      logger.warn(`WhatsApp Twilio retry for ${formatted}`)
      result = await attemptSend(tw, formatted, body)
      if (result.success) {
        await logMessage(formatted, body, result.sid!, options?.trigger)
        return result
      }
      logger.warn(`Twilio failed for ${formatted}: ${result.error}`)
    }
  }

  // 3) CallMeBot
  if (callmebotApiKey) {
    const result = await sendViaCallMeBot(to, body)
    if (result.success) {
      await logMessage(to, body, result.sid, options?.trigger)
      return result
    }
    logger.warn(`CallMeBot failed for ${to}: ${result.error}`)
  }

  // 4) Final fallback: email
  logger.warn('All WhatsApp providers failed, falling back to email')
  await logMessage(to, body, undefined, options?.trigger, 'All providers failed')

  if (options?.fallbackEmail) {
    logger.info(`Falling back to email for ${options.fallbackEmail}`)
    await sendMail({
      to: options.fallbackEmail,
      subject: options.fallbackSubject || 'Techlution AI Notification',
      html: baseTemplate('Notification', `
        <p style="color:#94a3b8;font-size:15px;line-height:1.7;">${body.replace(/\n/g, '<br>')}</p>
      `, '🔔 Notification'),
    })
  }

  return { success: false, error: 'All WhatsApp providers failed – email fallback used' }
}

async function attemptSend(tw: Twilio.Twilio, to: string, body: string): Promise<SendResult> {
  try {
    const msg = await tw.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      body,
    })
    return { success: true, sid: msg.sid }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unknown Twilio error' }
  }
}

/**
 * Send bulk WhatsApp messages (rate-limited: 1 per second).
 */
export async function sendBulkWhatsApp(
  recipients: { phone: string; fallbackEmail?: string }[],
  body: string,
  trigger?: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  for (const r of recipients) {
    const result = await sendWhatsAppMessage(r.phone, body, {
      trigger,
      fallbackEmail: r.fallbackEmail,
      fallbackSubject: 'Techlution AI Update',
    })
    if (result.success) sent++
    else failed++

    // Rate limit: 1 msg/sec to stay within Twilio limits
    if (recipients.indexOf(r) < recipients.length - 1) {
      await new Promise(res => setTimeout(res, 1000))
    }
  }

  return { sent, failed }
}

/**
 * Send WhatsApp to admin number.
 */
export async function notifyAdmin(body: string, trigger?: string): Promise<SendResult> {
  if (!adminNumber && !callmebotPhone) {
    logger.warn('ADMIN_WHATSAPP_NUMBER and CALLMEBOT_PHONE not set')
    return { success: false, error: 'Admin number not configured' }
  }
  const target = adminNumber || callmebotPhone || ''
  return sendWhatsAppMessage(target, body, { trigger, fallbackEmail: process.env.ADMIN_EMAIL })
}

// ─── Phone Validation ────────────────────────────────────────────────────────

function formatPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  // Must start with + and have 10-15 digits
  if (/^\+\d{10,15}$/.test(cleaned)) return cleaned
  // If only digits (no +), assume it needs one
  if (/^\d{10,15}$/.test(cleaned)) return `+${cleaned}`
  return null
}

// ─── Logging ─────────────────────────────────────────────────────────────────

async function logMessage(to: string, body: string, sid?: string, trigger?: string, error?: string) {
  try {
    await prisma.whatsAppLog.create({
      data: {
        to,
        body: body.substring(0, 2000),
        twilioSid: sid,
        status: error ? 'FAILED' : 'SENT',
        error,
        trigger,
      },
    })
  } catch (e) {
    logger.error('Failed to log WhatsApp message:', e)
  }
}

// ─── CRM Helpers ─────────────────────────────────────────────────────────────

/**
 * Find or create a WhatsApp contact and open a conversation.
 */
export async function findOrCreateContact(phone: string, name?: string) {
  const formatted = formatPhone(phone)
  if (!formatted) return null

  let contact = await prisma.whatsAppContact.findUnique({ where: { phone: formatted } })
  if (!contact) {
    contact = await prisma.whatsAppContact.create({
      data: { phone: formatted, name, tags: ['LEAD'] },
    })
  }
  return contact
}

/**
 * Save incoming/outgoing message to CRM and update conversation.
 */
export async function saveMessage(
  contactId: string,
  body: string,
  direction: 'INCOMING' | 'OUTGOING',
  twilioSid?: string
) {
  // Find or create open conversation
  let convo = await prisma.whatsAppConversation.findFirst({
    where: { contactId, status: 'OPEN' },
  })
  if (!convo) {
    convo = await prisma.whatsAppConversation.create({
      data: { contactId, status: 'OPEN' },
    })
  }

  const msg = await prisma.whatsAppMessage.create({
    data: {
      contactId,
      conversationId: convo.id,
      direction,
      body,
      twilioSid,
      status: direction === 'INCOMING' ? 'DELIVERED' : 'SENT',
    },
  })

  // Update contact lastMessageAt
  await prisma.whatsAppContact.update({
    where: { id: contactId },
    data: { lastMessageAt: new Date() },
  })

  return { message: msg, conversation: convo }
}

// ─── Message Templates ───────────────────────────────────────────────────────

export const waTemplates = {
  newInquiry: (name: string, message: string) =>
    `📩 *New Inquiry Received*\n\n👤 Name: ${name}\n💬 Message: ${message}\n\n🕐 ${new Date().toLocaleString()}`,

  projectCreated: (title: string) =>
    `🚀 *New Project Created*\n\nProject: ${title}\n\nPlease check your dashboard for details.`,

  projectAssigned: (title: string, memberCount: number, deadline?: string) =>
    `🚀 *Project Assigned*\n\nProject: ${title}\nMembers: ${memberCount}${deadline ? `\nDeadline: ${deadline}` : ''}\n\nPlease check your dashboard.`,

  projectCompleted: (title: string, shareAmount?: number) =>
    `✅ *Project Completed*\n\nProject: ${title}${shareAmount ? `\n💰 Your Share: $${shareAmount.toLocaleString()}` : ''}\n\nGreat work! 🎉`,

  proposalSent: (title: string, budget: number) =>
    `📋 *Proposal Received*\n\nProject: ${title}\nBudget: $${budget.toLocaleString()}\n\nPlease review and respond at your earliest convenience.\n\n— Techlution AI`,

  proposalAccepted: (title: string) =>
    `🎉 *Proposal Accepted!*\n\nProject: ${title}\n\nWe're excited to start working on your project!\n\n— Techlution AI`,

  proposalRejected: (title: string) =>
    `📋 *Proposal Update*\n\nProject: ${title}\nStatus: Not Accepted\n\nWe appreciate your consideration. Feel free to reach out for future projects.\n\n— Techlution AI`,

  reportReady: (reportType: string, downloadUrl?: string) =>
    `📊 *Report Ready*\n\nType: ${reportType}${downloadUrl ? `\n🔗 Download: ${downloadUrl}` : ''}\n\n— Techlution AI`,

  deadlineReminder: (title: string, daysLeft: number) =>
    `⏰ *Deadline Reminder*\n\nProject: ${title}\nDays Remaining: ${daysLeft}\n\nPlease ensure everything is on track.`,

  broadcast: (subject: string, message: string) =>
    `📢 *${subject}*\n\n${message}\n\n— Techlution AI`,
}
