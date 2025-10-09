const roleNames: Record<string, string> = {
  admin: 'Administrador',
  owner: 'Propietario',
  healthMember: 'Beneficiario Salud',
  educationMember: 'Beneficiario Educación',
  member: 'Miembro',
}

export function formatRoles(roles: string[] | undefined | null): string {
  if (!roles || roles.length === 0) {
    return 'Sin rol'
  }

  if (roles.length === 1) {
    return roleNames[roles[0]] || roles[0]
  }

  const hasHealthMember = roles.includes('healthMember')
  const hasEducationMember = roles.includes('educationMember')

  if (hasHealthMember && hasEducationMember) {
    return 'Beneficiario Salud y Educación'
  }

  const formattedRoles = roles
    .map((role) => roleNames[role] || role)
    .filter((value, index, self) => self.indexOf(value) === index)

  return formattedRoles.join(', ')
}
