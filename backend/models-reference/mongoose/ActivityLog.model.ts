import mongoose, { Schema, Document, Types } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IActivityLog extends Document {
  action: string
  entity: string | null
  entityId: string | null
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  adminUserId: Types.ObjectId | null
  createdAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      index: true,
    },
    entity: { type: String, default: null, trim: true },
    entityId: { type: String, default: null },
    details: { type: String, default: null, maxlength: 2000 },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'activity_logs',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

ActivityLogSchema.index({ createdAt: -1 })
ActivityLogSchema.index({ action: 1, createdAt: -1 })
ActivityLogSchema.index({ adminUserId: 1, createdAt: -1 })

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)
