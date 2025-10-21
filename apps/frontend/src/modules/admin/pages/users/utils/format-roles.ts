const roleNames: Record<string, string> = {
  admin: 'Administrador',
  owner: 'Propietario',
  healthMember: 'Personal de Salud',
  educationMember: 'Personal de Educación',
}

export function formatRoles(
  roles: string[] | string | undefined | null,
): string {
  if (!roles) {
    return 'Sin rol'
  }

  const rolesArray =
    typeof roles === 'string' ? roles.split(',').filter(Boolean) : roles

  const filteredRoles = rolesArray.filter((role) => role !== 'owner')

  if (filteredRoles.length === 0) {
    return 'Sin rol'
  }

  if (filteredRoles.length === 1) {
    return roleNames[filteredRoles[0]] || filteredRoles[0]
  }

  const hasHealthMember = filteredRoles.includes('healthMember')
  const hasEducationMember = filteredRoles.includes('educationMember')

  if (hasHealthMember && hasEducationMember) {
    return 'Personal de Salud y Educación'
  }

  const formattedRoles = filteredRoles
    .map((role) => roleNames[role] || role)
    .filter((value, index, self) => self.indexOf(value) === index)

  return formattedRoles.join(', ')
}
