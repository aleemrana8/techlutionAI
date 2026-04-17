import nodemailer, { Transporter } from 'nodemailer'
import logger from '../utils/logger'

let transporter: Transporter | null = null

export function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    transporter.verify().catch((err) =>
      logger.warn('SMTP connection warning (email may not work):', err.message)
    )
  }
  return transporter
}
