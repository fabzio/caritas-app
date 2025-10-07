import type { AccessMatrix } from '../types/access'
import type { ValidRoutes } from '../types/valid-routes'

export type OrganizationType =
  | 'caritas'
  | 'health'
  | 'education'
  | 'beneficiary'

type Team = {
  name?: string | null
}

type RedirectInput = {
  role?: string | string[] | null
  access?: AccessMatrix | null
  organizationType?: OrganizationType | null
  teams?: ReadonlyArray<Team> | null
  hasOrganizations?: boolean | null
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const hasTeam = (teams: RedirectInput['teams'], target: string) =>
  teams?.some((team) => team?.name && normalize(team.name) === target) ?? false

const toRoleList = (role: RedirectInput['role']) => {
  if (!role) return []
  if (Array.isArray(role)) return role.filter(Boolean).map(String)
  return [role]
}

const isAdmin = (input: RedirectInput) => {
  if (input.access?.admin) return true
  return toRoleList(input.role).some((value) =>
    value.toLowerCase().includes('admin'),
  )
}

const getRouteFromCaritas = (input: RedirectInput): ValidRoutes | undefined => {
  if (hasTeam(input.teams, 'salud')) return '/health'
  if (hasTeam(input.teams, 'educacion')) return '/education'
  return undefined
}

const getRouteFromOrganization = (
  input: RedirectInput,
): ValidRoutes | undefined => {
  if (!input.organizationType) return undefined
  if (
    input.organizationType === 'health' ||
    input.organizationType === 'education'
  ) {
    return '/organization'
  }
  if (input.organizationType === 'beneficiary') return '/beneficiary'
  if (input.organizationType === 'caritas') return getRouteFromCaritas(input)
  return undefined
}

const getRouteFromAccess = (
  access: RedirectInput['access'],
): ValidRoutes | undefined => {
  if (!access) return undefined
  if (access.health.admin || access.health.user) return '/health'
  if (access.education.admin || access.education.user) return '/education'
  if (access.health.organization || access.education.organization) {
    return '/organization'
  }
  if (access.beneficiary) return '/beneficiary'
  return undefined
}

export const redirectByProperties = (
  input: RedirectInput = {},
): ValidRoutes => {
  if (input.hasOrganizations === false) return '/user'
  const organizationRoute = getRouteFromOrganization(input)
  if (organizationRoute) return organizationRoute

  if (isAdmin(input)) return '/admin'

  const accessRoute = getRouteFromAccess(input.access)
  if (accessRoute) return accessRoute

  return '/user'
}
