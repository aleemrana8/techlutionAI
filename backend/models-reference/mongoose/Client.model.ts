import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const CLIENT_STATUSES = ['ACTIVE', 'INACTIVE', 'PROSPECT'] as const
export type ClientStatusType = (typeof CLIENT_STATUSES)[number]

export interface IClient extends Document {
  name: string
  email: string
  phone: string | null
  company: string | null
  industry: string | null
  status: ClientStatusType
  notes: string | null
  projects: number
  revenue: number
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },
    phone: { type: String, default: null, trim: true },
    company: { type: String, default: null, trim: true },
    industry: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: { values: CLIENT_STATUSES, message: 'Invalid client status: {VALUE}' },
      default: 'PROSPECT',
      index: true,
    },
    notes: { type: String, default: null, maxlength: 5000 },
    projects: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    collection: 'clients',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

ClientSchema.index({ status: 1, createdAt: -1 })
ClientSchema.index({ revenue: -1 })

export default mongoose.model<IClient>('Client', ClientSchema)
