import Elysia from 'elysia'
import betterAuth from '../middleware'
import { getOrganizationType, getTeam, getUserRole } from './service'

const access = new Elysia({}).use(betterAuth).get(
  '/access',
  async ({ user, session }) => {
    const orgsType = await getOrganizationType(
      session.activeOrganizationId ?? '',
    )
    const teamType = await getTeam(session.activeTeamId ?? '')

    const { isPatient, isStudent } = await getUserRole(session.userId)
    const isHealthOrg = orgsType.some((org) => org.type === 'health')
    return {
      admin:
        user.role?.includes('admin') ||
        teamType.some((team) => team.name === 'Administración'),
      health: {
        admin: teamType.some((team) => team.name === 'Salud'),
        organization: isHealthOrg,
        user: isPatient,
      },
      education: {
        admin: teamType.some((team) => team.name === 'Educación'),
        organization: orgsType.some((org) => org.type === 'education'),
        user: isStudent,
      },
      beneficiary: orgsType.some((org) => org.type === 'beneficiary'),
    }
  },
  {
    auth: true,
  },
)

export default access
