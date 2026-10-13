/**
 * Role-Based Access Control (RBAC)
 * Manage roles, permissions, and assignments
 */

export interface Role {
  id: string
  name: string
  description: string
  color: string
  system: boolean     // true for default roles
  permissions: string[]
}

export interface Permission {
  id: string
  label: string
  description: string
  category: 'data' | 'models' | 'system' | 'users' | 'audit'
}

export const PERMISSIONS: Permission[] = [
  // Data
  { id: 'datasets.view', label: 'View Datasets', description: 'View dataset list and details', category: 'data' },
  { id: 'datasets.create', label: 'Create Datasets', description: 'Upload new datasets', category: 'data' },
  { id: 'datasets.delete', label: 'Delete Datasets', description: 'Remove datasets permanently', category: 'data' },
  // Models
  { id: 'models.view', label: 'View Models', description: 'View model list and metrics', category: 'models' },
  { id: 'models.create', label: 'Register Models', description: 'Add new models to registry', category: 'models' },
  { id: 'models.delete', label: 'Delete Models', description: 'Remove models permanently', category: 'models' },
  // System
  { id: 'settings.view', label: 'View Settings', description: 'Access system settings', category: 'system' },
  { id: 'settings.edit', label: 'Edit Settings', description: 'Modify system configuration', category: 'system' },
  { id: 'apiKeys.manage', label: 'Manage API Keys', description: 'Create and revoke API keys', category: 'system' },
  // Users
  { id: 'users.view', label: 'View Users', description: 'See user directory', category: 'users' },
  { id: 'users.invite', label: 'Invite Users', description: 'Send invitations to new users', category: 'users' },
  { id: 'users.manage', label: 'Manage Users', description: 'Edit roles and remove users', category: 'users' },
  // Audit
  { id: 'audit.view', label: 'View Audit Log', description: 'Access the audit trail', category: 'audit' },
  { id: 'audit.export', label: 'Export Audit', description: 'Download audit reports', category: 'audit' },
]

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features and settings',
    color: '#FF453A',
    system: true,
    permissions: PERMISSIONS.map(p => p.id),
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Day-to-day operations on datasets and models',
    color: '#0071E3',
    system: true,
    permissions: [
      'datasets.view', 'datasets.create',
      'models.view', 'models.create',
      'audit.view',
    ],
  },
  {
    id: 'auditor',
    name: 'Auditor',
    description: 'Read-only access with audit and export capabilities',
    color: '#FF9F0A',
    system: true,
    permissions: [
      'datasets.view', 'models.view',
      'audit.view', 'audit.export',
      'settings.view', 'users.view',
    ],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only view of the workspace',
    color: '#30D158',
    system: true,
    permissions: [
      'datasets.view', 'models.view',
    ],
  },
]

const ROLES_KEY = 'cv_integrity_roles'
const ASSIGNMENTS_KEY = 'cv_integrity_role_assignments'

export function getAllRoles(): Role[] {
  try {
    const raw = localStorage.getItem(ROLES_KEY)
    if (!raw) {
      localStorage.setItem(ROLES_KEY, JSON.stringify(DEFAULT_ROLES))
      return DEFAULT_ROLES
    }
    return JSON.parse(raw) as Role[]
  } catch {
    return DEFAULT_ROLES
  }
}

function saveRoles(roles: Role[]): void {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles))
}

export function updateRolePermission(roleId: string, permissionId: string, enabled: boolean): void {
  const roles = getAllRoles()
  const idx = roles.findIndex(r => r.id === roleId)
  if (idx === -1) return

  const perms = new Set(roles[idx].permissions)
  if (enabled) perms.add(permissionId)
  else perms.delete(permissionId)
  roles[idx].permissions = Array.from(perms)

  saveRoles(roles)
}

export function createRole(name: string, description: string, color: string): Role {
  const roles = getAllRoles()
  const newRole: Role = {
    id: 'role_' + Math.random().toString(36).substring(2, 10),
    name,
    description,
    color,
    system: false,
    permissions: [],
  }
  roles.push(newRole)
  saveRoles(roles)
  return newRole
}

export function deleteRole(roleId: string): boolean {
  const roles = getAllRoles()
  const role = roles.find(r => r.id === roleId)
  if (!role || role.system) return false
  saveRoles(roles.filter(r => r.id !== roleId))
  return true
}

export function getRoleAssignments(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY)
    if (!raw) {
      // Default: current user is admin
      const user = JSON.parse(localStorage.getItem('cv_integrity_user') || '{}')
      if (user.username) {
        const defaults: Record<string, string> = { [user.username]: 'admin' }
        localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(defaults))
        return defaults
      }
      return {}
    }
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function assignRole(username: string, roleId: string): void {
  const assignments = getRoleAssignments()
  assignments[username] = roleId
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
}

export function getUserRole(username: string): Role | null {
  const assignments = getRoleAssignments()
  const roleId = assignments[username]
  if (!roleId) return null
  return getAllRoles().find(r => r.id === roleId) || null
}

export function hasPermission(username: string, permissionId: string): boolean {
  const role = getUserRole(username)
  if (!role) return false
  return role.permissions.includes(permissionId)
}

export const CATEGORY_LABELS: Record<string, string> = {
  data: 'Datasets',
  models: 'Models',
  system: 'System',
  users: 'Users',
  audit: 'Audit',
}
