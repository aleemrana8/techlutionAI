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
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  try {
    const { name, email, phone, service, message } = req.body
    if (!name || !message) return res.status(400).json({ success: false, message: 'Name and message are required' })

    const transporter = getTransporter()
    const now = new Date()
    const timestamp = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    // Admin email
    const adminHtml = baseTemplate('Client Inquiry – Techlution AI',
      `<h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0 0 6px;">Client Inquiry Received</h1>
      <p style="font-size:13px;color:#64748b;margin:0 0 20px;">A potential client has submitted an inquiry through the website.</p>
      <div style="font-size:11px;color:#475569;margin-bottom:20px;">🕐 ${timestamp}</div>
      <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 24px;"></div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">Client Details</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:110px;">👤 Name</span><span style="color:#ffffff;font-weight:700;">${name}</span></td></tr>
        <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:110px;">📧 Email</span><a href="mailto:${email || ''}" style="color:#f97316;font-weight:600;text-decoration:none;">${email || 'Not provided'}</a></td></tr>
        <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:#64748b;display:inline-block;width:110px;">📞 Phone</span><span style="color:#e2e8f0;font-weight:600;">${phone || 'Not provided'}</span></td></tr>
        ${service ? `<tr><td style="padding:16px 20px;font-size:13px;"><span style="color:#64748b;display:inline-block;width:110px;">💼 Service</span><span style="display:inline-block;padding:3px 12px;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.25);border-radius:6px;color:#fb923c;font-weight:700;font-size:12px;">${service}</span></td></tr>` : ''}
      </table>
      <div style="margin-top:24px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#64748b;font-weight:600;margin-bottom:12px;">📝 Message</div>
      <div style="background:rgba(249,115,22,0.04);border:1px solid rgba(249,115,22,0.12);border-radius:12px;padding:20px;border-left:3px solid #f97316;">
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin:0;white-space:pre-wrap;">${message}</p>
      </div>
      ${email ? `<div style="border-top:1px solid rgba(255,255,255,0.06);margin:20px 0;"></div><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="text-align:center;"><a href="mailto:${email}?subject=Re: Your inquiry – Techlution AI&body=Hi ${name.split(' ')[0]}," style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">Reply to ${name.split(' ')[0]}</a></td></tr></table>` : ''}`,
      '🔔 Client Inquiry')

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Techlution AI" <raleem811811@gmail.com>',
      to: process.env.ADMIN_EMAIL || 'raleem811811@gmail.com',
      subject: `[Techlution AI] 🔔 Client Inquiry – ${service || 'General'} – ${name}`,
      html: adminHtml,
    })

    // Client confirmation
    if (email) {
      const clientHtml = baseTemplate('Thank you for reaching out – Techlution AI',
        `<h1 style="font-size:24px;font-weight:800;color:#ffffff;margin:0 0 6px;">Thank you, ${name}! 👋</h1>
        <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 8px;">We've successfully received your inquiry and our team at <span style="color:#ffffff;font-weight:600;">Techlution AI</span> is already reviewing your requirements.</p>
        <p style="font-size:14px;color:#94a3b8;line-height:1.7;margin:0 0 20px;">You can expect a response within the next <span style="color:#f97316;font-weight:700;">24 hours</span>.</p>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"></div>
        <div style="background:rgba(249,115,22,0.04);border:1px solid rgba(249,115,22,0.1);border-radius:12px;padding:18px;margin-bottom:20px;">
          <p style="font-size:13px;color:#94a3b8;line-height:1.7;margin:0;">✨ At <span style="color:#e2e8f0;font-weight:600;">Techlution AI</span>, we specialize in delivering intelligent AI-powered solutions that automate workflows, optimize operations, and help businesses scale efficiently.</p>
        </div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="text-align:center;"><a href="https://techlution-ai.vercel.app/#services" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">Explore Our Services</a></td></tr></table>`,
        '✅ Message Received')

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Techlution AI" <raleem811811@gmail.com>',
        to: email,
        subject: 'Thank you for reaching out – Techlution AI',
        html: clientHtml,
      })
    }

    res.status(200).json({ success: true, message: 'Inquiry submitted successfully' })
  } catch (err: any) {
    console.error('Contact API error:', err)
    res.status(500).json({ success: false, message: 'Failed to send. Please email us at raleem811811@gmail.com' })
  }
}
