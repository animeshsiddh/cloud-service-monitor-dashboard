/** @vitest-environment node */
import { describe, expect, it } from 'vitest'
import { hasRoleAccess } from './roles'

describe('hasRoleAccess', () => {
  it('allows when roles list empty or missing', () => {
    expect(hasRoleAccess(undefined, 'Viewer')).toBe(true)
    expect(hasRoleAccess([], 'Viewer')).toBe(true)
  })
  it('matches membership', () => {
    expect(hasRoleAccess(['Admin'], 'Admin')).toBe(true)
    expect(hasRoleAccess(['Admin'], 'Viewer')).toBe(false)
  })
})
