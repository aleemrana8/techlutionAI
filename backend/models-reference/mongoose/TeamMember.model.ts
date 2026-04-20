import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const EMPLOYEE_STATUSES = ['ACTIVE', 'ON_LEAVE', 'TERMINATED'] as const
export type EmployeeStatusType = (typeof EMPLOYEE_STATUSES)[number]

export interface ITeamMember extends Document {
  name: string
  email: string
  phone: string | null
  role: string
  department: string
  status: EmployeeStatusType
  workload: number
  salary: number | null
  isFounder: boolean
  joinDate: Date
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
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
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: { values: EMPLOYEE_STATUSES, message: 'Invalid employee status: {VALUE}' },
      default: 'ACTIVE',
      index: true,
    },
    workload: {
      type: Number,
      default: 0,
      min: [0, 'Workload cannot be negative'],
      max: [100, 'Workload cannot exceed 100'],
    },
    salary: { type: Number, default: null, min: 0 },
    isFounder: { type: Boolean, default: false },
    joinDate: { type: Date, default: Date.now },
    notes: { type: String, default: null, maxlength: 5000 },
  },
  {
    timestamps: true,
    collection: 'employees',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

TeamMemberSchema.index({ status: 1, department: 1 })
TeamMemberSchema.index({ workload: -1 })
TeamMemberSchema.index({ isFounder: 1 })

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema)
