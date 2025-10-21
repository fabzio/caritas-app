import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'

const application = new Elysia({
  name: 'application',
  prefix: '/application',
}).use(betterAuth)
// .get('', getOrganization, {
//   auth: true,
//   response: {
//     200: OrganizationModel.getOrganization,
//     401: t.Literal('Unauthorized'),
//   },
// })
export default application
