import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'

import { OrganizationModel } from './model'
import {
  createOrganization,
  getOrganizations,
  getSingleOrganization,
} from './service'

const organization = new Elysia({
  name: 'organization',
  prefix: '/organization',
})
  // .use(betterAuth)
  .get('', ({ query }) => getOrganizations(query), {
    auth: true,
    query: OrganizationModel.listOrganizationsQuery,
    response: {
      200: OrganizationModel.getOrganization,
      401: t.Literal('Unauthorized'),
    },
  })
  .post('', ({ body }) => createOrganization(body), {
    auth: true,
    body: OrganizationModel.createOrganization,
    response: {
      200: t.String({
        description: 'ID of the created organization',
      }),
      401: t.Literal('Unauthorized'),
    },
  })
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
      },
    },
  )

export default organization
