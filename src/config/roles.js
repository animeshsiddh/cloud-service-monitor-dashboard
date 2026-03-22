/**
 * @param {string[] | undefined} allowedRoles
 * @param {string} userRole
 */
export function hasRoleAccess(allowedRoles, userRole) {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(userRole)
}
