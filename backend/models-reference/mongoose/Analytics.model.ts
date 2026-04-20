import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IAnalytics extends Document {
  date: Date
  metric: string
  value: number
  metadata: Record<string, unknown> | null
  createdAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date: { type: Date, default: Date.now, index: true },
    metric: {
      type: String,
      required: [true, 'Metric name is required'],
      trim: true,
      index: true,
    },
    value: {
      type: Number,
      required: [true, 'Metric value is required'],
    },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'analytics_snapshots',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

AnalyticsSchema.index({ metric: 1, date: -1 })
AnalyticsSchema.index({ date: -1, metric: 1 })

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema)
