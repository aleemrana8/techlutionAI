import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function baseTemplate(title: string, body: string, badge?: string): string {
  const year = new Date().getFullYear()
  const badgeHtml = badge || '🔔 Techlution AI'
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#070b14;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#e2e8f0;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:linear-gradient(145deg,#0f172a,#1a2332);border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.4);">
      <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:28px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="vertical-align:middle;">
            <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;"><span style="color:#f97316;">Techlution</span><span style="color:#e2e8f0;"> AI</span></div>
            <div style="font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">AI-Powered IT Solutions</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <div style="display:inline-block;padding:5px 14px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.3);border-radius:999px;font-size:12px;font-weight:600;color:#fb923c;">${badgeHtml}</div>
          </td>
        </tr></table>
      </div>
      <div style="padding:32px;">${body}</div>
      <div style="background:#0b1120;padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="text-align:center;margin-bottom:16px;"><span style="font-size:16px;font-weight:800;color:#f97316;">Techlution</span><span style="font-size:16px;font-weight:800;color:#94a3b8;"> AI</span></div>
        <div style="text-align:center;font-size:12px;color:#64748b;margin-bottom:12px;">Innovate &bull; Automate &bull; Elevate</div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:12px 0;"></div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="text-align:center;font-size:11px;color:#475569;line-height:1.8;">
          📍 City Park Road, Islamabad, Pakistan<br/>📞 +92 315 1664843<br/>✉️ <a href="mailto:raleem811811@gmail.com" style="color:#f97316;text-decoration:none;">raleem811811@gmail.com</a>
        </td></tr></table>
        <div style="text-align:center;font-size:10px;color:#334155;margin-top:14px;">&copy; ${year} Techlution AI. All rights reserved.</div>
      </div>
    </div>
  </div>
</body></html>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  try {
    const { name, email, phone, service, budget, timeline, message } = req.body
    if (!name || !service || !message) return res.status(400).json({ success: false, message: 'Name, service, and message are required' })

    const transporter = getTransporter()
    const now = new Date()
    const timestamp = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const refId = 'PRJ-' + Date.now().toString(36).toUpperCase()

    // Admin email
    const adminHtml = baseTemplate('Project Proposal – Techlution AI',
      `<div style="display:inline-block;padding:6px 16px;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.3);border-radius:999px;font-size:12px;font-weight:700;color:#22d3ee;margin-bottom:16px;">🚀 Project Proposal</div>
      <h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 6px;">Project Proposal Received</h1>
      <p style="font-size:13px;color:#64748b;margin:0 0 6px;">A client wants to start a new project with Techlution AI.</p>
      <div style="font-size:11px;color:#475569;margin-bottom:6px;">🕐 ${timestamp}</div>
      <div style="font-size:11px;color:#475569;margin-bottom:20px;">🔖 Ref: <span style="color:#22d3ee;font-weight:600;">${refId}</span></div>
      <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 24px;"></div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">👤 Client Information</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">👤 Name</span><span style="color:#ffffff;font-weight:700;">${name}</span></td></tr>
        <tr><td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">📧 Email</span>${email ? `<a href="mailto:${email}" style="color:#f97316;font-weight:600;text-decoration:none;">${email}</a>` : '<span style="color:#64748b;">Not provided</span>'}</td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;"><span style="color:#64748b;display:inline-block;width:100px;">📞 Phone</span><span style="color:#e2e8f0;font-weight:600;">${phone || 'Not provided'}</span></td></tr>
      </table>
      <div style="margin-top:24px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">📋 Project Specifications</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(6,182,212,0.03);border:1px solid rgba(6,182,212,0.12);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:110px;">💼 Service</span><span style="display:inline-block;padding:4px 14px;background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.3);border-radius:8px;color:#22d3ee;font-weight:700;font-size:13px;">${service}</span></td></tr>
        ${budget ? `<tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:110px;">💰 Budget</span><span style="color:#10b981;font-weight:700;font-size:14px;">${budget}</span></td></tr>` : ''}
        ${timeline ? `<tr><td style="padding:16px 20px;font-size:13px;"><span style="color:#64748b;display:inline-block;width:110px;">⏱️ Timeline</span><span style="color:#f59e0b;font-weight:700;">${timeline}</span></td></tr>` : ''}
      </table>
      <div style="margin-top:24px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">📝 Project Brief</div>
      <div style="background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.12);border-radius:12px;padding:20px;border-left:3px solid #06b6d4;">
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin:0;white-space:pre-wrap;">${message}</p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.06);margin:20px 0;"></div>
      <div style="background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.15);border-radius:10px;padding:14px 18px;margin-bottom:24px;">
        <p style="font-size:12px;color:#fb923c;margin:0;font-weight:600;">⚡ This is a project request — please prioritize and respond within 24 hours.</p>
      </div>
      ${email ? `<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="text-align:center;"><a href="mailto:${email}?subject=Re: Your Project Request (${refId}) – Techlution AI" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">Reply to ${name.split(' ')[0]} →</a></td></tr></table>` : ''}`,
      '🚀 Project Proposal')

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Techlution AI" <raleem811811@gmail.com>',
      to: process.env.ADMIN_EMAIL || 'raleem811811@gmail.com',
      subject: `[Techlution AI] 🚀 Project Proposal – ${service} – ${name}`,
      html: adminHtml,
    })

    // Client confirmation
    if (email) {
      const clientHtml = baseTemplate('Your project request has been received – Techlution AI',
        `<h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 6px;">We're excited to work with you, ${name.split(' ')[0]}! 🚀</h1>
        <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">Your project request has been received and our senior team at <span style="color:#ffffff;font-weight:600;">Techlution AI</span> is reviewing your requirements right now.</p>
        <div style="background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.15);border-radius:12px;padding:20px;margin-bottom:20px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:14px;">📋 Your Project Summary</div>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="padding:8px 0;font-size:13px;"><span style="color:#64748b;">Service:</span><span style="color:#22d3ee;font-weight:700;margin-left:8px;">${service}</span></td></tr>
            ${budget ? `<tr><td style="padding:8px 0;font-size:13px;"><span style="color:#64748b;">Budget:</span><span style="color:#10b981;font-weight:700;margin-left:8px;">${budget}</span></td></tr>` : ''}
            ${timeline ? `<tr><td style="padding:8px 0;font-size:13px;"><span style="color:#64748b;">Timeline:</span><span style="color:#f59e0b;font-weight:700;margin-left:8px;">${timeline}</span></td></tr>` : ''}
          </table>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"></div>
        <div style="font-size:14px;font-weight:700;color:#ffffff;margin-bottom:14px;">What happens next?</div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding:10px 0;font-size:13px;color:#94a3b8;"><span style="display:inline-block;width:28px;height:28px;background:rgba(6,182,212,0.15);border-radius:8px;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#22d3ee;margin-right:12px;">1</span>Our team will analyze your requirements</td></tr>
          <tr><td style="padding:10px 0;font-size:13px;color:#94a3b8;"><span style="display:inline-block;width:28px;height:28px;background:rgba(6,182,212,0.15);border-radius:8px;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#22d3ee;margin-right:12px;">2</span>A consultant will contact you within <span style="color:#f97316;font-weight:700;">24 hours</span></td></tr>
          <tr><td style="padding:10px 0;font-size:13px;color:#94a3b8;"><span style="display:inline-block;width:28px;height:28px;background:rgba(6,182,212,0.15);border-radius:8px;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#22d3ee;margin-right:12px;">3</span>We'll present a custom proposal with scope & pricing</td></tr>
        </table>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:20px 0;"></div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="text-align:center;"><a href="https://techlution-ai.vercel.app/#projects" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">View Our Work</a></td></tr></table>`,
        '✅ Request Confirmed')

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Techlution AI" <raleem811811@gmail.com>',
        to: email,
        subject: 'Your project request has been received – Techlution AI',
        html: clientHtml,
      })
    }

    res.status(200).json({ success: true, message: 'Project request submitted successfully' })
  } catch (err: any) {
    console.error('Project API error:', err)
    res.status(500).json({ success: false, message: 'Failed to send. Please email us at raleem811811@gmail.com' })
  }
}
