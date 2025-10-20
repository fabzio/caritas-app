import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { FairModel } from './model'
import { getFairs } from './service'

const fair = new Elysia({
  name: 'fair',
  prefix: '/fairs',
})
  .use(betterAuth)
  .get('/', ({ query }) => getFairs(query), {
    auth: true,
    query: FairModel.listFairsQuery,
    response: {
      200: FairModel.getFairsResponse,
      401: t.Literal('Unauthorized'),
    },
  })

export default fair
