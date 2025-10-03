import Elysia, { t } from 'elysia'
import betterAuth from '@/modules/auth/middleware'
import { HealthOrganizationModel } from './model'
import { createHealthOrganization, getHealthOrganizations } from './service'

const healthOrganization = new Elysia({
  name: 'healthOrganization',
  prefix: '/health-organization',
})
  // .use(betterAuth)
  .get('', getHealthOrganizations, {
    auth: true,
    response: {
      200: HealthOrganizationModel.getHealthOrganization,
      401: t.Literal('Unauthorized'),
    },
  })
  .post('', ({ body }) => createHealthOrganization(body), {
    auth: true,
    body: HealthOrganizationModel.createHealthOrganization,
    response: {
      200: t.String({
        description: 'ID of the created health organization',
      }),
      401: t.Literal('Unauthorized'),
    },
  })

export default healthOrganization
