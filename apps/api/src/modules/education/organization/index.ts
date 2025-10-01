import Elysia, { t } from 'elysia'
import betterAuth from '@/modules/auth/middleware'
import { OrganizationMayorModel } from './model'
import { getOrganizationMajors } from './service'

const organization = new Elysia({
  name: 'organization',
  prefix: '/organization',
})
  .use(betterAuth)
  .get('', getOrganizationMajors, {
    auth: true,
    response: {
      200: OrganizationMayorModel.getOrganizationMajors,
      401: t.Literal('Unauthorized'),
    },
  })
export default organization
