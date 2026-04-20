import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const REC_PRIORITIES = ['high', 'medium', 'low'] as const
export type RecPriority = (typeof REC_PRIORITIES)[number]

export interface IAIRecommendation extends Document {
  priority: RecPriority
  type: string
  message: string
  action: string | null
  route: string | null
  isResolved: boolean
  resolvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const AIRecommendationSchema = new Schema<IAIRecommendation>(
  {
    priority: {
      type: String,
      enum: { values: REC_PRIORITIES, message: 'Invalid priority: {VALUE}' },
      required: [true, 'Priority is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Recommendation type is required'],
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    action: { type: String, default: null, trim: true },
    route: { type: String, default: null, trim: true },
    isResolved: { type: Boolean, default: false, index: true },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'ai_recommendations',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

AIRecommendationSchema.index({ isResolved: 1, priority: 1, createdAt: -1 })
AIRecommendationSchema.index({ type: 1, createdAt: -1 })

export default mongoose.model<IAIRecommendation>('AIRecommendation', AIRecommendationSchema)
