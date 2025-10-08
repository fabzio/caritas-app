import { auth } from '@api/lib/auth'
import Elysia from 'elysia'
import betterAuth from '../middleware'
import { getOrganizationType, getTeam, getUserRole } from './service'

const access = new Elysia({}).use(betterAuth).get(
  '/access',
  async ({ session, request: { headers } }) => {
    const orgsType = await getOrganizationType(
      session.activeOrganizationId ?? '',
    )
    const teamType = await getTeam(session.activeTeamId ?? '')
    try {
      const { role } = await auth.api.getActiveMemberRole({
        headers,
      })

      const { isPatient, isStudent } = await getUserRole(session.userId)
      const isHealthOrg = orgsType.some((org) => org.type === 'health')
      return {
        admin:
          orgsType.some((org) => org.type === 'caritas') &&
          ['owner', 'admin'].includes(role),
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
    } catch {
      return {
        admin: false,
        health: {
          admin: false,
          organization: false,
          user: true,
        },
        education: {
          admin: false,
          organization: false,
          user: true,
        },
        beneficiary: false,
      }
    }
  },
  {
    auth: true,
  },
)

export default access
