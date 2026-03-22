/** @vitest-environment node */
import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './relativeTime'

describe('formatRelativeTime', () => {
  it('returns em dash for invalid date', () => {
    expect(formatRelativeTime('not-a-date')).toBe('—')
  })
  it('returns a relative string for valid ISO', () => {
    const past = new Date(Date.now() - 120000).toISOString()
    const s = formatRelativeTime(past)
    expect(typeof s).toBe('string')
    expect(s.length).toBeGreaterThan(0)
  })
})
