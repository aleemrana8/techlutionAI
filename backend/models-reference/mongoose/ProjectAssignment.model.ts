import mongoose, { Schema, Document, Types } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IProjectAssignment extends Document {
  projectRef: string
  employeeId: Types.ObjectId
  roleInProject: string | null
  assignedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const ProjectAssignmentSchema = new Schema<IProjectAssignment>(
  {
    projectRef: {
      type: String,
      required: [true, 'Project reference is required'],
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'TeamMember',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    roleInProject: { type: String, default: null, trim: true },
    assignedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: 'project_assignments',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

// Ensure one assignment per employee per project
ProjectAssignmentSchema.index({ projectRef: 1, employeeId: 1 }, { unique: true })

export default mongoose.model<IProjectAssignment>('ProjectAssignment', ProjectAssignmentSchema)
