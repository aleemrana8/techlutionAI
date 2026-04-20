import mongoose, { Schema, Document } from 'mongoose'

// ─── Types ───────────────────────────────────────────────────────────────────

export const PROJECT_STATUSES = ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const
export const PROJECT_CATEGORIES = [
  'HEALTHCARE', 'AI_ML', 'AUTOMATION', 'COMPUTER_VISION',
  'DEVOPS_CLOUD', 'DATA_PIPELINES', 'WEB_BACKEND', 'OTHER',
] as const

export type ProjectStatusType = (typeof PROJECT_STATUSES)[number]
export type ProjectCategoryType = (typeof PROJECT_CATEGORIES)[number]

export interface IWorkflowStep {
  title: string
  description: string
  order: number
}

export interface IProject extends Document {
  title: string
  slug: string
  shortDescription: string
  fullDescription: string
  category: ProjectCategoryType
  features: string[]
  workflowSteps: IWorkflowStep[]
  benefits: string[]
  images: string[]
  status: ProjectStatusType
  tags: string[]
  techStack: string[]
  durationWeeks: number | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const WorkflowStepSchema = new Schema<IWorkflowStep>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false },
)

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
    },
    category: {
      type: String,
      enum: { values: PROJECT_CATEGORIES, message: 'Invalid project category: {VALUE}' },
      required: [true, 'Category is required'],
      index: true,
    },
    features: { type: [String], default: [] },
    workflowSteps: { type: [WorkflowStepSchema], default: [] },
    benefits: { type: [String], default: [] },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: { values: PROJECT_STATUSES, message: 'Invalid project status: {VALUE}' },
      default: 'DRAFT',
      index: true,
    },
    tags: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    durationWeeks: { type: Number, default: null, min: 1 },
    createdById: {
      type: String,
      required: [true, 'Creator ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'projects',
  },
)

// ─── Indexes ─────────────────────────────────────────────────────────────────

ProjectSchema.index({ status: 1, category: 1 })
ProjectSchema.index({ createdAt: -1 })
ProjectSchema.index({ tags: 1 })
ProjectSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' })

export default mongoose.model<IProject>('Project', ProjectSchema)
