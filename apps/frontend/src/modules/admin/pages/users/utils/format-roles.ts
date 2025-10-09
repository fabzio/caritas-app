const roleNames: Record<string, string> = {
  admin: 'Administrador',
  owner: 'Propietario',
  healthMember: 'Beneficiario Salud',
  educationMember: 'Beneficiario Educación',
}

export function formatRoles(
  roles: string[] | string | undefined | null,
): string {
  if (!roles) {
    return 'Sin rol'
  }

  const rolesArray =
    typeof roles === 'string' ? roles.split(',').filter(Boolean) : roles

  if (rolesArray.length === 0) {
    return 'Sin rol'
  }

  if (rolesArray.length === 1) {
    return roleNames[rolesArray[0]] || rolesArray[0]
  }

  const hasHealthMember = rolesArray.includes('healthMember')
  const hasEducationMember = rolesArray.includes('educationMember')

  if (hasHealthMember && hasEducationMember) {
    return 'Beneficiario Salud y Educación'
  }

  const formattedRoles = rolesArray
    .map((role) => roleNames[role] || role)
    .filter((value, index, self) => self.indexOf(value) === index)

  return formattedRoles.join(', ')
}
