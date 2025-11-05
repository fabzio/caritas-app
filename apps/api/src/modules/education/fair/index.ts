import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { FairModel } from './model'
import {
  createFair,
  getFairRegions,
  getFairStatus,
  getFairs,
  getSingleFair,
  patchFair,
} from './service'

const fair = new Elysia({
  name: 'fair',
  prefix: '/fairs',
})
  .use(betterAuth)
  .get('/regions', () => getFairRegions(), {
    auth: true,
    response: {
      200: t.Array(
        t.Object({
          id: t.Number(),
          name: t.String(),
        }),
      ),
      401: t.Literal('Unauthorized'),
    },
  })
  .get('/status', () => getFairStatus(), {
    auth: true,
    response: {
      200: t.Array(
        t.Object({
          value: t.String(),
          label: t.String(),
        }),
      ),
      401: t.Literal('Unauthorized'),
    },
  })
  .get('/', ({ query }) => getFairs(query), {
    auth: true,
    query: FairModel.listFairsQuery,
    response: {
      200: FairModel.getFairsResponse,
      401: t.Literal('Unauthorized'),
    },
  })
  .get(
    '/:id',
    async ({ params }) => {
      const res = await getSingleFair({ id: Number(params.id) })
      if (!res) throw status(404, 'Fair not found')
      return res
    },
    {
      auth: true,
      params: FairModel.getSingleFairsQuery,
      response: {
        200: FairModel.getSingleFairsResponse,
        404: t.Literal('Fair not found'),
      },
    },
  )
  .post('', ({ body }) => createFair(body), {
    auth: true,
    body: FairModel.createFair,
    response: {
      200: t.Number({
        description: 'ID of the created fair',
      }),
      401: t.Literal('Unauthorized'),
    },
  })
  .patch(
    '/:id',
    async ({ params, body }) => await patchFair(Number(params.id), body),
    {
      auth: true,
      params: FairModel.getSingleFairsQuery,
      body: FairModel.updateFair,
      response: {
        200: t.Number({
          description: 'Number of updated rows',
        }),
        404: t.Literal('Fair not found'),
      },
    },
  )

export default fair
