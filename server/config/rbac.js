/**
 * Role-Based Access Control (RBAC) Specification for SkillSync
 * Corresponds to Experiment 4: Data Security via Roles, Permissions, and Views.
 *
 * Conceptual mapping:
 * - staff   -> Standard Student Member (create/manage own skills, send swap proposals)
 * - senior  -> Senior Peer Mentor (inherits staff + mentor endorsement and advanced workshops)
 * - HR      -> Campus Moderator / Skill Coordinator (moderation, sensitive user details, category management)
 * - auditor -> Quality & Compliance Auditor (read-only inspection across all resources, cannot mutate)
 * - admin   -> System Administrator (full administrative control, role assignment, audit logs)
 */

const ROLES = {
  STAFF: 'staff',
  USER: 'user', // Compatibility alias for Experiment 6 standard student/user
  SENIOR: 'senior',
  HR: 'HR',
  AUDITOR: 'auditor',
  ADMIN: 'admin',
};

const PERMISSIONS = {
  // Skill operations
  SKILLS_VIEW: 'skills:view',
  SKILLS_CREATE: 'skills:create',
  SKILLS_UPDATE: 'skills:update',
  SKILLS_DELETE: 'skills:delete',

  // Swap requests
  SWAPS_VIEW: 'swaps:view',
  SWAPS_CREATE: 'swaps:create',

  // User profile operations
  USERS_VIEW: 'users:view',
  USERS_VIEW_SENSITIVE: 'users:view_sensitive', // Protects private moderation/admin data
  USERS_MANAGE_ROLE: 'users:manage_role',       // Only admin can promote/change roles

  // Category management
  CATEGORIES_VIEW: 'categories:view',
  CATEGORIES_MANAGE: 'categories:manage',

  // Activity and Audit logs
  ACTIVITY_VIEW: 'activity:view',
  ACTIVITY_VIEW_RESTRICTED: 'activity:view_restricted',
  AUDIT_VIEW: 'audit:view',
};

// Explicit permissions granted to each role
const ROLE_PERMISSIONS = {
  [ROLES.STAFF]: [
    PERMISSIONS.SKILLS_VIEW,
    PERMISSIONS.SKILLS_CREATE,
    PERMISSIONS.SKILLS_UPDATE,
    PERMISSIONS.SKILLS_DELETE,
    PERMISSIONS.SWAPS_VIEW,
    PERMISSIONS.SWAPS_CREATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
  ],
  [ROLES.USER]: [
    // Same baseline student permissions as staff
    PERMISSIONS.SKILLS_VIEW,
    PERMISSIONS.SKILLS_CREATE,
    PERMISSIONS.SKILLS_UPDATE,
    PERMISSIONS.SKILLS_DELETE,
    PERMISSIONS.SWAPS_VIEW,
    PERMISSIONS.SWAPS_CREATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
  ],
  [ROLES.SENIOR]: [
    // Inherits all staff permissions
    PERMISSIONS.SKILLS_VIEW,
    PERMISSIONS.SKILLS_CREATE,
    PERMISSIONS.SKILLS_UPDATE,
    PERMISSIONS.SKILLS_DELETE,
    PERMISSIONS.SWAPS_VIEW,
    PERMISSIONS.SWAPS_CREATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
  ],
  [ROLES.HR]: [
    // Staff operations + moderation and category management + view sensitive records
    PERMISSIONS.SKILLS_VIEW,
    PERMISSIONS.SKILLS_CREATE,
    PERMISSIONS.SKILLS_UPDATE,
    PERMISSIONS.SKILLS_DELETE,
    PERMISSIONS.SWAPS_VIEW,
    PERMISSIONS.SWAPS_CREATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_VIEW_SENSITIVE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.ACTIVITY_VIEW_RESTRICTED,
  ],
  [ROLES.AUDITOR]: [
    // Read-only across everything, zero write/delete permissions
    PERMISSIONS.SKILLS_VIEW,
    PERMISSIONS.SWAPS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.ACTIVITY_VIEW_RESTRICTED,
    PERMISSIONS.AUDIT_VIEW,
  ],
  [ROLES.ADMIN]: [
    // Full access to all permissions
    PERMISSIONS.SKILLS_VIEW,
    PERMISSIONS.SKILLS_CREATE,
    PERMISSIONS.SKILLS_UPDATE,
    PERMISSIONS.SKILLS_DELETE,
    PERMISSIONS.SWAPS_VIEW,
    PERMISSIONS.SWAPS_CREATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_VIEW_SENSITIVE,
    PERMISSIONS.USERS_MANAGE_ROLE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.ACTIVITY_VIEW_RESTRICTED,
    PERMISSIONS.AUDIT_VIEW,
  ],
};

/**
 * Check if a given role possesses a required permission.
 */
function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
};
