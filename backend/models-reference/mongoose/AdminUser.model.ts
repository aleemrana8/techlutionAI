import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'MANAGER', 'SUPPORT'] as const
export type AdminRoleType = (typeof ADMIN_ROLES)[number]

export interface IAdminUser extends Document {
  username: string
  email: string
  passwordHash: string
  name: string
  role: AdminRoleType
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const AdminUserSchema = new Schema<IAdminUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
      index: true,
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
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // exclude from queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      enum: { values: ADMIN_ROLES, message: 'Invalid admin role: {VALUE}' },
      default: 'SUPPORT',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'admin_users',
    toJSON: { virtuals: true, transform: (_, ret) => { delete ret.passwordHash; return ret } },
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

AdminUserSchema.index({ role: 1, isActive: 1 })
AdminUserSchema.index({ createdAt: -1 })

export default mongoose.model<IAdminUser>('AdminUser', AdminUserSchema)
