import mongoose, { Schema, Document, Types } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IOtherCost {
  name: string
  amount: number
}

export interface IProjectFinance extends Document {
  projectRef: string
  totalAmount: number
  fiverrFeePercent: number
  zakatEnabled: boolean
  zakatPercent: number
  otherCosts: IOtherCost[]
  totalDeductions: number
  netAmount: number
  sharePerPerson: number
  totalMembers: number
  founderIncluded: boolean
  calculatedAt: Date
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const OtherCostSchema = new Schema<IOtherCost>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const ProjectFinanceSchema = new Schema<IProjectFinance>(
  {
    projectRef: {
      type: String,
      required: [true, 'Project reference is required'],
      unique: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    fiverrFeePercent: {
      type: Number,
      default: 0,
      min: [0, 'Fiverr fee cannot be negative'],
      max: [100, 'Fiverr fee cannot exceed 100%'],
    },
    zakatEnabled: { type: Boolean, default: false },
    zakatPercent: {
      type: Number,
      default: 2.5,
      min: [0, 'Zakat percent cannot be negative'],
      max: [100, 'Zakat percent cannot exceed 100%'],
    },
    otherCosts: { type: [OtherCostSchema], default: [] },
    totalDeductions: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, default: 0, min: 0 },
    sharePerPerson: { type: Number, default: 0, min: 0 },
    totalMembers: { type: Number, default: 0, min: 0 },
    founderIncluded: { type: Boolean, default: true },
    calculatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'project_finances',
  },
)

// ─── Virtual: Shares ─────────────────────────────────────────────────────────

ProjectFinanceSchema.virtual('shares', {
  ref: 'ProjectShare',
  localField: '_id',
  foreignField: 'projectFinanceId',
})

ProjectFinanceSchema.set('toJSON', { virtuals: true })
ProjectFinanceSchema.set('toObject', { virtuals: true })

export default mongoose.model<IProjectFinance>('ProjectFinance', ProjectFinanceSchema)
