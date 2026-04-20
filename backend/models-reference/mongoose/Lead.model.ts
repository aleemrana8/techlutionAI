import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const LEAD_TYPES = ['INQUIRY', 'PROPOSAL'] as const
export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'] as const
export type LeadTypeEnum = (typeof LEAD_TYPES)[number]
export type LeadStatusEnum = (typeof LEAD_STATUSES)[number]

export interface ILead extends Document {
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  message: string
  type: LeadTypeEnum
  budget: string | null
  timeline: string | null
  status: LeadStatusEnum
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },
    phone: { type: String, default: null, trim: true },
    company: { type: String, default: null, trim: true },
    service: { type: String, default: null, trim: true },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: { values: LEAD_TYPES, message: 'Invalid lead type: {VALUE}' },
      default: 'INQUIRY',
    },
    budget: { type: String, default: null },
    timeline: { type: String, default: null },
    status: {
      type: String,
      enum: { values: LEAD_STATUSES, message: 'Invalid lead status: {VALUE}' },
      default: 'NEW',
      index: true,
    },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: 'leads',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

LeadSchema.index({ status: 1, createdAt: -1 })
LeadSchema.index({ type: 1, status: 1 })
LeadSchema.index({ email: 1, createdAt: -1 })

export default mongoose.model<ILead>('Lead', LeadSchema)
