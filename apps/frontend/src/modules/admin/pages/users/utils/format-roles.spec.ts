import { describe, expect, it } from 'vitest'
import { formatRoles } from './format-roles'

describe('formatRoles', () => {
  it('returns "Sin rol" for empty array', () => {
    expect(formatRoles([])).toBe('Sin rol')
  })

  it('returns "Sin rol" for null', () => {
    expect(formatRoles(null)).toBe('Sin rol')
  })

  it('returns "Sin rol" for undefined', () => {
    expect(formatRoles(undefined)).toBe('Sin rol')
  })

  it('formats single admin role', () => {
    expect(formatRoles(['admin'])).toBe('Administrador')
  })

  it('formats single healthMember role', () => {
    expect(formatRoles(['healthMember'])).toBe('Personal de Salud')
  })

  it('formats single educationMember role', () => {
    expect(formatRoles(['educationMember'])).toBe('Personal de Educación')
  })

  it('formats both health and education members', () => {
    expect(formatRoles(['healthMember', 'educationMember'])).toBe(
      'Personal de Salud, Personal de Educación',
    )
  })

  it('formats both education and health members in any order', () => {
    const result = formatRoles(['educationMember', 'healthMember'])
    const parts = result
      .split(',')
      .map((p) => p.trim())
      .sort((a, b) => a.localeCompare(b))
    expect(parts).toEqual(
      ['Personal de Educación', 'Personal de Salud'].sort((a, b) =>
        a.localeCompare(b),
      ),
    )
  })

  it('formats multiple different roles', () => {
    const result = formatRoles(['admin'])
    expect(result).toContain('Administrador')
  })

  it('handles unknown role', () => {
    expect(formatRoles(['unknownRole'])).toBe('unknownRole')
  })

  it('removes duplicate roles', () => {
    expect(formatRoles(['admin', 'admin'])).toBe('Administrador')
  })
})
