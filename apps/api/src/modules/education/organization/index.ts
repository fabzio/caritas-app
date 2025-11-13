import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { OrganizationModel } from './model'
import { getOrganization } from './service'

const organization = new Elysia({
  name: 'organization',
  prefix: '/organization',
})
  .use(betterAuth)
  .get('', ({ query }) => getOrganization(query), {
    auth: true,
    query: t.Object({
      q: t.Optional(t.String()),
      active: t.Optional(t.Boolean()),
      page: t.Optional(t.Numeric({ minimum: 0, default: 0 })),
      limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
      sortBy: t.Optional(t.String()),
      type: t.Optional(t.String()),
    }),
    response: {
      200: OrganizationModel.paginatedOrganization,
      401: t.Literal('Unauthorized'),
    },
  })
export default organization
