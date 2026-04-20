// Role-based permission configuration for Techlution AI Admin System

export type AdminRoleName = 'SUPER_ADMIN' | 'ADMIN' | 'HR' | 'FINANCE' | 'MANAGER' | 'SUPPORT'

export interface RolePermissions {
  dashboard: boolean
  visitors: { read: boolean; write: boolean }
  leads: { read: boolean; write: boolean }
  clients: { read: boolean; write: boolean }
  employees: { read: boolean; write: boolean }
  finance: { read: boolean; write: boolean }
  projects: { read: boolean; write: boolean }
  analytics: boolean
  logs: boolean
  settings: boolean
  adminUsers: boolean
}

const fullAccess = { read: true, write: true }
const readOnly = { read: true, write: false }
const noAccess = { read: false, write: false }

export const ROLE_PERMISSIONS: Record<AdminRoleName, RolePermissions> = {
  SUPER_ADMIN: {
    dashboard: true,
    visitors: fullAccess,
    leads: fullAccess,
    clients: fullAccess,
    employees: fullAccess,
    finance: fullAccess,
    projects: fullAccess,
    analytics: true,
    logs: true,
    settings: true,
    adminUsers: true,
  },
  ADMIN: {
    dashboard: true,
    visitors: fullAccess,
    leads: fullAccess,
    clients: fullAccess,
    employees: fullAccess,
    finance: fullAccess,
    projects: fullAccess,
    analytics: true,
    logs: true,
    settings: true,
    adminUsers: false,
  },
  HR: {
    dashboard: true,
    visitors: noAccess,
    leads: noAccess,
    clients: noAccess,
    employees: fullAccess,
    finance: readOnly,
    projects: readOnly,
    analytics: true,
    logs: false,
    settings: false,
    adminUsers: false,
  },
  FINANCE: {
    dashboard: true,
    visitors: noAccess,
    leads: readOnly,
    clients: readOnly,
    employees: readOnly,
    finance: fullAccess,
    projects: readOnly,
    analytics: true,
    logs: false,
    settings: false,
    adminUsers: false,
  },
  MANAGER: {
    dashboard: true,
    visitors: readOnly,
    leads: readOnly,
    clients: readOnly,
    employees: readOnly,
    finance: readOnly,
    projects: fullAccess,
    analytics: true,
    logs: false,
    settings: false,
    adminUsers: false,
  },
  SUPPORT: {
    dashboard: true,
    visitors: noAccess,
    leads: readOnly,
    clients: readOnly,
    employees: noAccess,
    finance: noAccess,
    projects: readOnly,
    analytics: false,
    logs: false,
    settings: false,
    adminUsers: false,
  },
}

export function hasPermission(
  role: AdminRoleName,
  resource: keyof RolePermissions,
  action?: 'read' | 'write',
): boolean {
  const perms = ROLE_PERMISSIONS[role]
  if (!perms) return false
  const perm = perms[resource]
  if (typeof perm === 'boolean') return perm
  if (action) return perm[action]
  return perm.read || perm.write
}
