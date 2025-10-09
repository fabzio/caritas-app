import { auth } from '@api/lib/auth'
import Elysia from 'elysia'
import betterAuth from '../middleware'
import { getOrganizationType, getUserRole } from './service'

const access = new Elysia({}).use(betterAuth).get(
  '/access',
  async ({ session, request: { headers } }) => {
    const orgsType = await getOrganizationType(
      session.activeOrganizationId ?? '',
    )
    try {
      const { role } = await auth.api.getActiveMemberRole({
        headers,
      })

      const roles = role
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean)
      const { isPatient, isStudent } = await getUserRole(session.userId)
      const isHealthOrg = orgsType.some((org) => org.type === 'health')
      return {
        admin:
          orgsType.some((org) => org.type === 'caritas') &&
          (roles.includes('owner') || roles.includes('admin')),
        health: {
          admin: roles.includes('healthMember'),
          organization: isHealthOrg,
          user: isPatient,
        },
        education: {
          admin: roles.includes('educationMember'),
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
          user: false,
        },
        education: {
          admin: false,
          organization: false,
          user: false,
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
