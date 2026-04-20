import mongoose, { Schema, Document, Types } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const PAYMENT_STATUSES = ['PENDING', 'PAID'] as const
export type PaymentStatusType = (typeof PAYMENT_STATUSES)[number]

export interface IProjectShare extends Document {
  projectFinanceId: Types.ObjectId
  employeeId: Types.ObjectId
  shareAmount: number
  paymentStatus: PaymentStatusType
  notified: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const ProjectShareSchema = new Schema<IProjectShare>(
  {
    projectFinanceId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectFinance',
      required: [true, 'Project finance ID is required'],
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'TeamMember',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    shareAmount: {
      type: Number,
      required: [true, 'Share amount is required'],
      min: [0, 'Share amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: { values: PAYMENT_STATUSES, message: 'Invalid payment status: {VALUE}' },
      default: 'PENDING',
      index: true,
    },
    notified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'project_shares',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

// One share per employee per project finance record
ProjectShareSchema.index({ projectFinanceId: 1, employeeId: 1 }, { unique: true })

export default mongoose.model<IProjectShare>('ProjectShare', ProjectShareSchema)
