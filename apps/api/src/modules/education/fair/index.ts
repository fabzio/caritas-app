import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { FairModel } from './model'
import {
  createFair,
  deleteFairs,
  getFairs,
  getSingleFair,
  patchFair,
} from './service'

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
  .delete(
    '',
    async ({ body }) => {
      const { ids } = body
      if (!ids.length) {
        throw status(400, 'No hay ningún ID de feria para eliminar')
      }
      const deleted = await deleteFairs(ids)
      return deleted
    },
    {
      auth: true,
      body: FairModel.deleteFairs,
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.String(),
      },
    },
  )
export default fair
