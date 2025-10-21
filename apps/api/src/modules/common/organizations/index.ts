import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { OrganizationModel } from './model'
import { getOrganizationDetail } from './service'

const organizations = new Elysia({
  name: 'common.organizations',
  prefix: '/organizations',
})
  .use(betterAuth)
  .get(
    '/:id',
    async ({ params }) => {
      const organization = await getOrganizationDetail(params.id)
      if (!organization) throw status(404, 'Organization not found')
      return organization
    },
    {
      auth: true,
      params: OrganizationModel.getOrganizationParams,
      response: {
        200: OrganizationModel.getOrganizationResponse,
        401: t.Literal('Unauthorized'),
        404: t.Literal('Organization not found'),
      },
    },
  )

export default organizations
