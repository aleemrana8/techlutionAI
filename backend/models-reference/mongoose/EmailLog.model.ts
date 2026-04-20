import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const EMAIL_STATUSES = ['SENT', 'FAILED'] as const
export type EmailStatusType = (typeof EMAIL_STATUSES)[number]

export interface IEmailLog extends Document {
  to: string
  subject: string
  type: string
  projectRef: string | null
  status: EmailStatusType
  error: string | null
  createdAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const EmailLogSchema = new Schema<IEmailLog>(
  {
    to: {
      type: String,
      required: [true, 'Recipient email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [500, 'Subject cannot exceed 500 characters'],
    },
    type: {
      type: String,
      required: [true, 'Email type is required'],
      trim: true,
      index: true,
    },
    projectRef: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: { values: EMAIL_STATUSES, message: 'Invalid email status: {VALUE}' },
      default: 'SENT',
      index: true,
    },
    error: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'email_logs',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

EmailLogSchema.index({ createdAt: -1 })
EmailLogSchema.index({ type: 1, createdAt: -1 })

export default mongoose.model<IEmailLog>('EmailLog', EmailLogSchema)
