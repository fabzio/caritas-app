import Elysia from 'elysia'
import betterAuth from '../middleware'
import { getUserOrganizationsRoles, getUserRole } from './service'

const access = new Elysia({}).use(betterAuth).get(
  '/access',
  async ({ session }) => {
    try {
      const orgRoles = await getUserOrganizationsRoles(session.userId)

      const { isPatient, isStudent } = await getUserRole(session.userId)
      const caritasOrg = orgRoles.find(
        (orgRol) => orgRol.organization.type === 'caritas',
      )
      return {
        admin: caritasOrg
          ? caritasOrg?.role.split(',').includes('admin') ||
            caritasOrg?.role.split(',').includes('owner')
          : false,
        health: {
          admin: caritasOrg?.role.split(',').includes('healthMember'),
          organization: orgRoles.some(
            (orgRol) => orgRol.organization.type === 'health',
          ),
          user: isPatient,
        },
        education: {
          admin: caritasOrg?.role.split(',').includes('educationMember'),
          organization: orgRoles.some(
            (orgRol) => orgRol.organization.type === 'education',
          ),
          user: isStudent,
        },
        beneficiary: orgRoles.some(
          (orgRol) => orgRol.organization.type === 'beneficiary',
        ),
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
