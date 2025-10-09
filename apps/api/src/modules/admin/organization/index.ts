import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { OrganizationModel } from './model'
import { createOrganization, getOrganizations } from './service'

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
        description: 'ID of the created health organization',
      }),
      401: t.Literal('Unauthorized'),
    },
  })

export default organization
