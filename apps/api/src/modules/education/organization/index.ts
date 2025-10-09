import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { OrganizationModel } from './model'
import { getOrganization } from './service'

const organization = new Elysia({
  name: 'organization',
  prefix: '/organization',
})
  .use(betterAuth)
  .get('', getOrganization, {
    auth: true,
    response: {
      200: OrganizationModel.getOrganization,
      401: t.Literal('Unauthorized'),
    },
  })
export default organization
