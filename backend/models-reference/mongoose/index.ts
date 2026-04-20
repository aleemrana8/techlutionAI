// ─── Techlution AI — Mongoose Model Barrel Export ────────────────────────────
//
// All 15 production-ready Mongoose models for the Admin Portal.
// Each model maps 1:1 to the existing PostgreSQL/Prisma schema.
//
// Usage:
//   import { AdminUser, Lead, ProjectFinance } from './models/mongoose'
//

export { default as AdminUser } from './AdminUser.model'
export { default as Visitor } from './Visitor.model'
export { default as Lead } from './Lead.model'
export { default as Client } from './Client.model'
export { default as TeamMember } from './TeamMember.model'
export { default as Project } from './Project.model'
export { default as ProjectAssignment } from './ProjectAssignment.model'
export { default as ProjectFinance } from './ProjectFinance.model'
export { default as ProjectShare } from './ProjectShare.model'
export { default as Finance } from './Finance.model'
export { default as ActivityLog } from './ActivityLog.model'
export { default as EmailLog } from './EmailLog.model'
export { default as Analytics } from './Analytics.model'
export { default as AIRecommendation } from './AIRecommendation.model'

// Re-export types
export type { IAdminUser } from './AdminUser.model'
export type { IVisitor } from './Visitor.model'
export type { ILead } from './Lead.model'
export type { IClient } from './Client.model'
export type { ITeamMember } from './TeamMember.model'
export type { IProject } from './Project.model'
export type { IProjectAssignment } from './ProjectAssignment.model'
export type { IProjectFinance } from './ProjectFinance.model'
export type { IProjectShare } from './ProjectShare.model'
export type { IFinance } from './Finance.model'
export type { IActivityLog } from './ActivityLog.model'
export type { IEmailLog } from './EmailLog.model'
export type { IAnalytics } from './Analytics.model'
export type { IAIRecommendation } from './AIRecommendation.model'
