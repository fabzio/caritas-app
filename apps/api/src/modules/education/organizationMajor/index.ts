import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { OrganizationMayorModel } from './model'
import { getOrganizationMajors } from './service'

const organizationMajor = new Elysia({
  name: 'organizationMajor',
  prefix: '/organizationMajor',
})
  .use(betterAuth)
  .get('', getOrganizationMajors, {
    auth: true,
    response: {
      200: OrganizationMayorModel.getOrganizationMajors,
      401: t.Literal('Unauthorized'),
    },
  })
export default organizationMajor
