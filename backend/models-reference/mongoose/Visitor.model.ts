import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const VISITOR_DEVICES = ['DESKTOP', 'MOBILE', 'TABLET', 'OTHER'] as const
export type VisitorDeviceType = (typeof VISITOR_DEVICES)[number]

export interface IVisitor extends Document {
  ipAddress: string | null
  device: VisitorDeviceType
  browser: string | null
  os: string | null
  page: string | null
  referrer: string | null
  country: string | null
  city: string | null
  sessionId: string | null
  createdAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const VisitorSchema = new Schema<IVisitor>(
  {
    ipAddress: { type: String, default: null, index: true },
    device: {
      type: String,
      enum: { values: VISITOR_DEVICES, message: 'Invalid device type: {VALUE}' },
      default: 'OTHER',
    },
    browser: { type: String, default: null },
    os: { type: String, default: null },
    page: { type: String, default: null },
    referrer: { type: String, default: null },
    country: { type: String, default: null, index: true },
    city: { type: String, default: null },
    sessionId: { type: String, default: null, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'visitors',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

VisitorSchema.index({ createdAt: -1 })
VisitorSchema.index({ device: 1, createdAt: -1 })
VisitorSchema.index({ country: 1, createdAt: -1 })

export default mongoose.model<IVisitor>('Visitor', VisitorSchema)
