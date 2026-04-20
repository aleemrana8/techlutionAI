import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const FINANCE_TYPES = ['INCOME', 'EXPENSE'] as const
export type FinanceTypeEnum = (typeof FINANCE_TYPES)[number]

export interface IFinance extends Document {
  type: FinanceTypeEnum
  amount: number
  description: string
  category: string | null
  projectRef: string | null
  date: Date
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const FinanceSchema = new Schema<IFinance>(
  {
    type: {
      type: String,
      enum: { values: FINANCE_TYPES, message: 'Invalid finance type: {VALUE}' },
      required: [true, 'Finance type is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: { type: String, default: null, trim: true, index: true },
    projectRef: { type: String, default: null, index: true },
    date: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    collection: 'finances',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

FinanceSchema.index({ type: 1, date: -1 })
FinanceSchema.index({ projectRef: 1, type: 1 })

export default mongoose.model<IFinance>('Finance', FinanceSchema)
