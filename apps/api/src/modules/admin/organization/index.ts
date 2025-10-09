import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'

import { OrganizationModel } from './model'
import { getOrganizations, getSingleOrganization } from './service'

const organization = new Elysia({
  name: 'organization',
  prefix: '/organization',
})
  .use(betterAuth)
  .get(
    '/',
    ({ query, session: { activeOrganizationId } }) => {
      if (!activeOrganizationId) throw status(401, 'Unauthorized')
      return getOrganizations({
        ...query,
        organizationId: activeOrganizationId,
      })
    },
    {
      auth: true,
      query: OrganizationModel.listOrganizationsQuery,
      response: {
        200: OrganizationModel.getOrganization,
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const res = await getSingleOrganization(params)
      if (!res) throw status(404, 'Organization not found')
      return res
    },
    {
      auth: true,
      params: OrganizationModel.getSingleOrganizationQuery,
      response: {
        200: OrganizationModel.getSingleOrganizationResponse,
        404: t.Literal('Organization not found'),
      },
    },
  )

export default organization
