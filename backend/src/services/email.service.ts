import { getTransporter } from '../config/email'
import logger from '../utils/logger'

interface MailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: { filename: string; path: string }[]
}

export async function sendMail(options: MailOptions): Promise<void> {
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? '"Techlution AI" <noreply@techlution.ai>',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    })
    logger.info(`Email sent to ${options.to}`)
  } catch (err) {
    logger.error('Email send failed:', err)
    // Do not throw — email failures should not break the main flow
  }
}

// ─── Email Templates ─────────────────────────────────────────────────────────

export function baseTemplate(title: string, body: string, badge?: string): string {
  const year = new Date().getFullYear()
  const badgeHtml = badge || '🔔 Techlution AI'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#070b14;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#e2e8f0;-webkit-font-smoothing:antialiased;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <!-- Main card -->
    <div style="background:linear-gradient(145deg,#0f172a,#1a2332);border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.4);">

      <!-- Header bar -->
      <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:28px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="vertical-align:middle;">
            <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">
              <span style="color:#f97316;">Techlution</span><span style="color:#e2e8f0;"> AI</span>
            </div>
            <div style="font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">AI-Powered IT Solutions</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <div style="display:inline-block;padding:5px 14px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:999px;font-size:12px;font-weight:600;color:#fb923c;">${badgeHtml}</div>
          </td>
        </tr></table>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        ${body}
      </div>

      <!-- Footer -->
      <div style="background:#0b1120;padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="text-align:center;margin-bottom:16px;">
          <span style="font-size:16px;font-weight:800;color:#f97316;">Techlution</span><span style="font-size:16px;font-weight:800;color:#94a3b8;"> AI</span>
        </div>
        <div style="text-align:center;font-size:12px;color:#64748b;margin-bottom:12px;">
          Innovate &bull; Automate &bull; Elevate
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:12px 0;"></div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="text-align:center;font-size:11px;color:#475569;line-height:1.8;">
              📍 City Park Road, Islamabad, Pakistan<br/>
              📞 +92 315 1664843<br/>
              ✉️ <a href="mailto:raleem811811@gmail.com" style="color:#f97316;text-decoration:none;">raleem811811@gmail.com</a>
            </td>
          </tr>
        </table>
        <div style="text-align:center;font-size:10px;color:#334155;margin-top:14px;">
          &copy; ${year} Techlution AI. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function newProjectEmailAdmin(project: {
  title: string
  category: string
  shortDescription: string
  createdBy: string
}): string {
  return baseTemplate(
    'New Project Created',
    `<div style="display:inline-block;padding:5px 14px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);border-radius:999px;font-size:12px;font-weight:600;color:#22d3ee;margin-bottom:16px;">📋 New Project</div>
    <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 20px;">A new project has been created</h1>
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"></div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">📋 Title</span><span style="color:#e2e8f0;font-weight:600;">${project.title}</span></td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">🏷️ Category</span><span style="color:#f97316;font-weight:700;">${project.category}</span></td></tr>
      <tr><td style="padding:14px 18px;font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">👤 Created by</span><span style="color:#e2e8f0;font-weight:600;">${project.createdBy}</span></td></tr>
    </table>
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:20px 0;"></div>
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;font-size:14px;color:#94a3b8;line-height:1.7;">${project.shortDescription}</div>`,
  )
}

export function contactAdminEmail(lead: {
  name: string
  email: string
  phone?: string | null
  service?: string | null
  message: string
}): string {
  const now = new Date()
  const timestamp = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return baseTemplate(
    'Client Inquiry – Techlution AI',
    `<!-- Title -->
    <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;">Client Inquiry Received</h1>
    <p style="font-size:13px;color:#64748b;margin:0 0 20px;">A potential client has submitted an inquiry through the website.</p>

    <!-- Timestamp -->
    <div style="font-size:11px;color:#475569;margin-bottom:20px;">🕐 ${timestamp}</div>

    <!-- Divider -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 24px;"></div>

    <!-- Client Details Card -->
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">Client Details</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;">
            <span style="color:#64748b;display:inline-block;width:110px;">👤 Name</span>
            <span style="color:#ffffff;font-weight:700;">${lead.name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;">
            <span style="color:#64748b;display:inline-block;width:110px;">📧 Email</span>
            <a href="mailto:${lead.email}" style="color:#f97316;font-weight:600;text-decoration:none;">${lead.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;">
            <span style="color:#64748b;display:inline-block;width:110px;">📞 Phone</span>
            <span style="color:#e2e8f0;font-weight:600;">${lead.phone || 'Not provided'}</span>
          </td>
        </tr>
        ${lead.service ? `<tr>
          <td style="padding:16px 20px;font-size:13px;">
            <span style="color:#64748b;display:inline-block;width:110px;">💼 Service</span>
            <span style="display:inline-block;padding:3px 12px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.25);border-radius:6px;color:#fb923c;font-weight:700;font-size:12px;">${lead.service}</span>
          </td>
        </tr>` : ''}
      </table>
    </div>

    <!-- Message Section -->
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">📝 Project Details</div>
      <div style="background:rgba(249,115,22,0.04);border:1px solid rgba(249,115,22,0.12);border-radius:12px;padding:20px;border-left:3px solid #f97316;">
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin:0;white-space:pre-wrap;">${lead.message}</p>
      </div>
    </div>

    <!-- Divider -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"></div>

    <!-- Quick action -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="text-align:center;">
        <a href="mailto:${lead.email}?subject=Re: Your inquiry – Techlution AI&body=Hi ${lead.name},%0A%0AThank you for reaching out to Techlution AI.%0A%0A" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(249,115,22,0.3);">Reply to ${lead.name.split(' ')[0]}</a>
      </td>
    </tr></table>`,
    '🔔 Client Inquiry',
  )
}

export function contactConfirmationEmail(name: string): string {
  return baseTemplate(
    'Thank you for reaching out – Techlution AI',
    `<!-- Greeting -->
    <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 6px;">Thank you, ${name}! 👋</h1>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 8px;">
      We've successfully received your inquiry and our team at <span style="color:#ffffff;font-weight:600;">Techlution AI</span> is already reviewing your requirements.
    </p>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">
      You can expect a response from our experts within the next <span style="color:#f97316;font-weight:700;">24 hours</span> with tailored solutions and next steps.
    </p>

    <!-- Divider -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"></div>

    <!-- Value statement -->
    <div style="background:rgba(249,115,22,0.04);border:1px solid rgba(249,115,22,0.1);border-radius:12px;padding:18px;margin-bottom:20px;">
      <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin:0;">
        ✨ At <span style="color:#e2e8f0;font-weight:600;">Techlution AI</span>, we specialize in delivering intelligent AI-powered solutions that automate workflows, optimize operations, and help businesses scale efficiently.
      </p>
    </div>

    <!-- Engagement -->
    <p style="font-size:13px;color:#64748b;line-height:1.7;margin:0 0 20px;">
      In the meantime, feel free to explore our services, case studies, and innovative solutions designed for modern businesses.
    </p>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="text-align:center;">
        <a href="https://techlution.ai/#services" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(249,115,22,0.3);">Explore Our Services</a>
      </td>
    </tr></table>`,
    '✅ Message Received',
  )
}

// ─── Project Request Emails (Start Project form) ─────────────────────────────

export function projectRequestAdminEmail(project: {
  name: string
  email?: string | null
  phone?: string | null
  service: string
  budget?: string | null
  timeline?: string | null
  message: string
}): string {
  const now = new Date()
  const timestamp = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const refId = 'PRJ-' + Date.now().toString(36).toUpperCase()

  return baseTemplate(
    'Project Proposal – Techlution AI',
    `<!-- Badge -->
    <div style="display:inline-block;padding:6px 16px;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.3);border-radius:999px;font-size:12px;font-weight:700;color:#22d3ee;margin-bottom:16px;">🚀 Project Proposal</div>

    <!-- Title -->
    <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 6px;">Project Proposal Received</h1>
    <p style="font-size:13px;color:#64748b;margin:0 0 6px;">A client wants to start a new project with Techlution AI.</p>
    <div style="font-size:11px;color:#475569;margin-bottom:6px;">🕐 ${timestamp}</div>
    <div style="font-size:11px;color:#475569;margin-bottom:20px;">🔖 Ref: <span style="color:#22d3ee;font-weight:600;">${refId}</span></div>

    <!-- Divider -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 24px;"></div>

    <!-- Client Info -->
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">👤 Client Information</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;">
          <span style="color:#64748b;display:inline-block;width:100px;">👤 Name</span>
          <span style="color:#ffffff;font-weight:700;">${project.name}</span>
        </td></tr>
        <tr><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;">
          <span style="color:#64748b;display:inline-block;width:100px;">📧 Email</span>
          ${project.email ? `<a href="mailto:${project.email}" style="color:#f97316;font-weight:600;text-decoration:none;">${project.email}</a>` : `<span style="color:#64748b;font-style:italic;">Not provided</span>`}
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;">
          <span style="color:#64748b;display:inline-block;width:100px;">📞 Phone</span>
          <span style="color:#e2e8f0;font-weight:600;">${project.phone || 'Not provided'}</span>
        </td></tr>
      </table>
    </div>

    <!-- Project Specs -->
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">📋 Project Specifications</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(6,182,212,0.03);border:1px solid rgba(6,182,212,0.12);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;">
          <span style="color:#64748b;display:inline-block;width:110px;">💼 Service</span>
          <span style="display:inline-block;padding:4px 14px;background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.3);border-radius:8px;color:#22d3ee;font-weight:700;font-size:13px;">${project.service}</span>
        </td></tr>
        ${project.budget ? `<tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;">
          <span style="color:#64748b;display:inline-block;width:110px;">💰 Budget</span>
          <span style="color:#10b981;font-weight:700;font-size:14px;">${project.budget}</span>
        </td></tr>` : ''}
        ${project.timeline ? `<tr><td style="padding:16px 20px;font-size:13px;">
          <span style="color:#64748b;display:inline-block;width:110px;">⏱️ Timeline</span>
          <span style="color:#f59e0b;font-weight:700;">${project.timeline}</span>
        </td></tr>` : ''}
      </table>
    </div>

    <!-- Project Brief -->
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">📝 Project Brief</div>
      <div style="background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.12);border-radius:12px;padding:20px;border-left:3px solid #06b6d4;">
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin:0;white-space:pre-wrap;">${project.message}</p>
      </div>
    </div>

    <!-- Divider -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"></div>

    <!-- Priority notice -->
    <div style="background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.15);border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="font-size:12px;color:#fb923c;margin:0;font-weight:600;">⚡ This is a project request — please prioritize and respond within 24 hours.</p>
    </div>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="text-align:center;">
        ${project.email ? `<a href="mailto:${project.email}?subject=Re: Your Project Request (${refId}) – Techlution AI&body=Hi ${project.name.split(' ')[0]},%0A%0AThank you for your project request.%0A%0AWe've reviewed your requirements for ${encodeURIComponent(project.service)} and would love to discuss the next steps.%0A%0A" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(6,182,212,0.3);">Reply to ${project.name.split(' ')[0]} →</a>` : `<span style="font-size:13px;color:#64748b;">No email provided — contact via phone</span>`}
      </td>
    </tr></table>`,
    '🚀 Project Proposal',
  )
}

export function projectConfirmationEmail(name: string, service: string, budget?: string, timeline?: string): string {
  return baseTemplate(
    'Your project request has been received – Techlution AI',
    `<!-- Greeting -->
    <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 6px;">We're excited to work with you, ${name.split(' ')[0]}! 🚀</h1>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">
      Your project request has been received and our senior team at <span style="color:#ffffff;font-weight:600;">Techlution AI</span> is reviewing your requirements right now.
    </p>

    <!-- Project summary card -->
    <div style="background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.15);border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:14px;">📋 Your Project Summary</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding:8px 0;font-size:13px;">
          <span style="color:#64748b;">Service:</span>
          <span style="color:#22d3ee;font-weight:700;margin-left:8px;">${service}</span>
        </td></tr>
        ${budget ? `<tr><td style="padding:8px 0;font-size:13px;">
          <span style="color:#64748b;">Budget:</span>
          <span style="color:#10b981;font-weight:700;margin-left:8px;">${budget}</span>
        </td></tr>` : ''}
        ${timeline ? `<tr><td style="padding:8px 0;font-size:13px;">
          <span style="color:#64748b;">Timeline:</span>
          <span style="color:#f59e0b;font-weight:700;margin-left:8px;">${timeline}</span>
        </td></tr>` : ''}
      </table>
    </div>

    <!-- Divider -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"></div>

    <!-- What happens next -->
    <div style="margin-bottom:20px;">
      <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:14px;">What happens next?</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#94a3b8;vertical-align:top;">
            <span style="display:inline-block;width:28px;height:28px;background:rgba(6,182,212,0.15);border-radius:8px;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#22d3ee;margin-right:12px;">1</span>
            Our team will analyze your requirements in detail
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#94a3b8;vertical-align:top;">
            <span style="display:inline-block;width:28px;height:28px;background:rgba(6,182,212,0.15);border-radius:8px;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#22d3ee;margin-right:12px;">2</span>
            A senior consultant will contact you within <span style="color:#f97316;font-weight:700;">24 hours</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#94a3b8;vertical-align:top;">
            <span style="display:inline-block;width:28px;height:28px;background:rgba(6,182,212,0.15);border-radius:8px;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#22d3ee;margin-right:12px;">3</span>
            We'll present a custom proposal with scope, timeline & pricing
          </td>
        </tr>
      </table>
    </div>

    <!-- Divider -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"></div>

    <!-- Value proposition -->
    <div style="background:rgba(249,115,22,0.04);border:1px solid rgba(249,115,22,0.1);border-radius:12px;padding:18px;margin-bottom:20px;">
      <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin:0;">
        🏆 With <span style="color:#e2e8f0;font-weight:600;">100+ projects delivered</span> and a <span style="color:#e2e8f0;font-weight:600;">100% client satisfaction rate</span>, Techlution AI delivers enterprise-grade solutions that scale with your business.
      </p>
    </div>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="text-align:center;">
        <a href="https://techlution.ai/#projects" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(6,182,212,0.3);">View Our Work</a>
      </td>
    </tr></table>`,
    '✅ Request Confirmed',
  )
}

// ─── Proposal Email Templates ────────────────────────────────────────────────

export function proposalSentEmail(data: { clientName: string; title: string; description: string; budget: number }): string {
  return baseTemplate(
    'New Proposal – Techlution AI',
    `<h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;">Hi ${data.clientName.split(' ')[0]},</h1>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">We've prepared a new proposal for your review.</p>
    <div style="background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.15);border-radius:12px;padding:20px;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding:8px 0;font-size:13px;"><span style="color:#64748b;">📋 Title:</span> <span style="color:#ffffff;font-weight:700;margin-left:8px;">${data.title}</span></td></tr>
        <tr><td style="padding:8px 0;font-size:13px;"><span style="color:#64748b;">💰 Budget:</span> <span style="color:#10b981;font-weight:700;margin-left:8px;">$${data.budget.toLocaleString()}</span></td></tr>
      </table>
    </div>
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;margin-bottom:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:8px;">Description</div>
      <p style="font-size:14px;color:#cbd5e1;line-height:1.7;margin:0;">${data.description}</p>
    </div>
    <p style="font-size:13px;color:#94a3b8;">Our team is ready to start as soon as you approve. Reply to this email or contact us at <a href="mailto:raleem811811@gmail.com" style="color:#f97316;">raleem811811@gmail.com</a></p>`,
    '📋 Proposal',
  )
}

export function proposalAcceptedEmail(data: { clientName: string; title: string; budget: number }): string {
  return baseTemplate(
    'Proposal Accepted – Techlution AI',
    `<h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;">Great news, ${data.clientName.split(' ')[0]}! 🎉</h1>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">Your proposal <strong style="color:#ffffff;">"${data.title}"</strong> has been accepted and the project is now active.</p>
    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="font-size:16px;font-weight:700;color:#10b981;margin-bottom:8px;">✅ Project Started</div>
      <p style="font-size:13px;color:#94a3b8;margin:0;">Budget: <strong style="color:#10b981;">$${data.budget.toLocaleString()}</strong> — Our team has been assigned and work begins immediately.</p>
    </div>
    <p style="font-size:13px;color:#94a3b8;">We'll keep you updated on progress. For any questions, reach us at <a href="mailto:raleem811811@gmail.com" style="color:#f97316;">raleem811811@gmail.com</a> | 📞 +92 315 1664843</p>`,
    '✅ Accepted',
  )
}

export function proposalRejectedEmail(data: { clientName: string; title: string }): string {
  return baseTemplate(
    'Proposal Update – Techlution AI',
    `<h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;">Hi ${data.clientName.split(' ')[0]},</h1>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">After careful review, the proposal <strong style="color:#ffffff;">"${data.title}"</strong> has been updated. We'd love to explore other ways to work together.</p>
    <p style="font-size:13px;color:#94a3b8;margin-bottom:20px;">If you'd like to discuss adjustments or new project ideas, we're always here to help.</p>
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="text-align:center;">
        <a href="mailto:raleem811811@gmail.com?subject=Re: ${data.title}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">Let's Discuss</a>
      </td>
    </tr></table>`,
    '📋 Update',
  )
}

export function inquiryResponseEmail(data: { name: string; originalMessage: string; response: string }): string {
  return baseTemplate(
    'Response to Your Inquiry – Techlution AI',
    `<h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;">Hi ${data.name.split(' ')[0]},</h1>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">Thank you for reaching out to Techlution AI. Here's our response to your inquiry:</p>
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:8px;">Your Message</div>
      <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0;">${data.originalMessage}</p>
    </div>
    <div style="background:rgba(249,115,22,0.04);border:1px solid rgba(249,115,22,0.12);border-radius:12px;padding:18px;border-left:3px solid #f97316;margin-bottom:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#f97316;font-weight:600;margin-bottom:8px;">Our Response</div>
      <p style="font-size:14px;color:#e2e8f0;line-height:1.7;margin:0;">${data.response}</p>
    </div>
    <p style="font-size:13px;color:#94a3b8;">Feel free to reply to this email for further discussion. We're here to help!</p>`,
    '💬 Response',
  )
}

export function memberAssignmentEmail(data: {
  memberName: string; projectTitle: string; role?: string;
  description?: string; fullDescription?: string; budget?: number; currency?: string; deadline?: Date | string | null;
  timeline?: string | number | null; teamMembers?: { name: string; role: string }[]; totalMembers?: number;
  netAmount?: number; sharePerPerson?: number; fiverrFeePercent?: number; zakatEnabled?: boolean; zakatPercent?: number;
  totalDeductions?: number; files?: string[]; category?: string;
}): string {
  const cur = data.currency || 'USD'
  const deadlineStr = data.deadline ? new Date(data.deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : null
  const daysLeft = data.deadline ? Math.ceil((new Date(data.deadline).getTime() - Date.now()) / 86400000) : null

  const tableRow = (label: string, value: string, color = '#e2e8f0') =>
    `<tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.04);"><span style="color:#64748b;">${label}</span></td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;"><span style="color:${color};font-weight:700;">${value}</span></td></tr>`

  let rows = tableRow('Project', data.projectTitle, '#ffffff')
  if (data.category) rows += tableRow('Category', data.category)
  if (data.role) rows += tableRow('Your Role', data.role, '#22d3ee')
  if (data.budget) rows += tableRow('Total Budget', `${cur} ${data.budget.toLocaleString()}`, '#4ade80')
  if (data.totalDeductions) rows += tableRow('Deductions', `-${cur} ${data.totalDeductions.toLocaleString()}`, '#f87171')
  if (data.netAmount) rows += tableRow('Net Amount', `${cur} ${data.netAmount.toLocaleString()}`, '#4ade80')
  if (data.sharePerPerson) rows += tableRow('Your Share', `${cur} ${data.sharePerPerson.toLocaleString()}`, '#22d3ee')
  if (data.fiverrFeePercent) rows += tableRow('Fiverr Fee', `${data.fiverrFeePercent}%`)
  if (data.zakatEnabled) rows += tableRow('Zakat', `${data.zakatPercent || 2.5}%`)
  if (data.timeline) rows += tableRow('Timeline', `${data.timeline} weeks`)
  if (deadlineStr) rows += tableRow('Deadline', deadlineStr, '#fb923c')
  if (daysLeft !== null) rows += tableRow('Days Left', `${daysLeft} days`, daysLeft <= 7 ? '#ef4444' : daysLeft <= 30 ? '#f97316' : '#4ade80')
  if (data.totalMembers) rows += tableRow('Team Size', `${data.totalMembers} members`)

  const desc = data.fullDescription || data.description
  const descBlock = desc ? `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:20px;"><p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Project Description</p><p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;">${desc}</p></div>` : ''

  const teamBlock = data.teamMembers?.length ? `<div style="margin-bottom:20px;"><p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Your Team</p>${data.teamMembers.map(t => `<div style="display:flex;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);"><span style="color:#ffffff;font-size:13px;font-weight:600;">${t.name}</span><span style="color:#64748b;font-size:12px;margin-left:8px;">&mdash; ${t.role}</span></div>`).join('')}</div>` : ''

  const filesBlock = data.files?.length ? `<div style="margin-bottom:20px;"><p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Attached Files</p>${data.files.map(f => `<p style="color:#22d3ee;font-size:13px;margin:4px 0;">📎 ${f.split('/').pop()}</p>`).join('')}</div>` : ''

  return baseTemplate(
    'Project Assignment - Techlution AI',
    `<h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;">Hi ${data.memberName.split(' ')[0]},</h1>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">You have been assigned to a new project at <strong style="color:#f97316;">Techlution AI</strong>. We are excited to have you on board!</p>
    <div style="background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.15);border-radius:12px;padding:20px;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table>
    </div>
    ${descBlock}
    ${teamBlock}
    ${filesBlock}
    <div style="background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(6,182,212,0.08));border:1px solid rgba(249,115,22,0.15);border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="color:#fb923c;font-size:14px;font-weight:700;margin:0 0 8px;">You have Got This!</p>
      <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;">Every great project begins with a single step and you have just taken yours. Your skills and dedication are exactly what this project needs. Lets build something extraordinary together. The team is counting on you, and we know you will deliver excellence!</p>
    </div>
    <p style="font-size:13px;color:#64748b;margin-top:16px;">Ready to make an impact? Lets go!</p>`,
    'Assignment',
  )
}
export function projectCompletionShareEmail(data: { memberName: string; projectTitle: string; shareAmount: number; totalBudget: number; totalMembers: number }): string {
  return baseTemplate(
    'Project Completed – Your Share Details',
    `<h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;">Great work, ${data.memberName.split(' ')[0]}! 🎉</h1>
    <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">The project <strong style="color:#ffffff;">"${data.projectTitle}"</strong> has been completed. Here are your share details:</p>
    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding:8px 0;font-size:13px;"><span style="color:#64748b;">💰 Total Budget:</span> <span style="color:#ffffff;font-weight:700;margin-left:8px;">$${data.totalBudget.toLocaleString()}</span></td></tr>
        <tr><td style="padding:8px 0;font-size:13px;"><span style="color:#64748b;">👥 Team Size:</span> <span style="color:#ffffff;font-weight:700;margin-left:8px;">${data.totalMembers} members</span></td></tr>
        <tr><td style="padding:8px 0;font-size:16px;"><span style="color:#64748b;">🎯 Your Share:</span> <span style="color:#10b981;font-weight:800;margin-left:8px;">$${data.shareAmount.toLocaleString()}</span></td></tr>
      </table>
    </div>
    <p style="font-size:13px;color:#94a3b8;">Payment will be processed shortly. Thank you for your contribution! 🚀</p>`,
    '💰 Payment',
  )
}

