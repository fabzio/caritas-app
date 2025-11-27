import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { FairModel } from './model'
import {
  checkFairsOngoingOrEnded,
  createFair,
  deleteFairs,
  findDuplicateFair,
  getFairRegions,
  getFairStatus,
  getFairs,
  getFairsAttendance,
  getSingleFair,
  patchFair,
  updateFairAttendance,
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
    query: FairModel.listFairsQuery,
    response: {
      200: FairModel.getFairsResponse,
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
  .post(
    '',
    async ({ body }) => {
      const duplicate = await findDuplicateFair(
        body.title,
        body.regionId,
        new Date(body.date),
        body.startTime,
        body.endTime,
      )

      if (duplicate) {
        throw status(
          400,
          `Ya existe una feria vocacional llamada "${duplicate.title}" en el mismo distrito, fecha y horario.`,
        )
      }

      return createFair(body)
    },
    {
      auth: true,
      body: FairModel.createFair,
      response: {
        200: t.Number({ description: 'ID of the created fair' }),
        400: t.String(),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body }) => {
      const id = Number(params.id)
      if (
        body.title &&
        body.regionId &&
        body.date &&
        body.startTime &&
        body.endTime
      ) {
        const duplicate = await findDuplicateFair(
          body.title,
          Number(body.regionId),
          new Date(body.date),
          body.startTime,
          body.endTime,
          id,
        )

        if (duplicate) {
          throw status(
            400,
            `Ya existe una feria vocacional llamada "${duplicate.title}" en el mismo distrito, fecha y horario.`,
          )
        }
      }

      return await patchFair(id, body)
    },
    {
      auth: true,
      params: FairModel.getSingleFairsQuery,
      body: FairModel.updateFair,
      response: {
        200: t.Number({ description: 'Number of updated rows' }),
        400: t.String(),
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
      const fairsOngoingOrEnded = await checkFairsOngoingOrEnded(ids)

      if (fairsOngoingOrEnded.length > 0) {
        throw status(409, {
          fairsOngoingOrEnded,
        })
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
        409: FairModel.deleteFairsOngoingOrEnded,
      },
    },
  )
  .get('/attendance', ({ query }) => getFairsAttendance(query), {
    auth: true,
    query: FairModel.listFairsQuery,
    response: {
      200: FairModel.getAttendanceResponse,
      401: t.Literal('Unauthorized'),
    },
  })
  .patch(
    '/:id/attendance',
    async ({ params, body }) => {
      const id = Number(params.id)
      const updated = await updateFairAttendance(id, body)
      return updated
    },
    {
      auth: true,
      params: FairModel.getSingleFairsQuery,
      body: FairModel.updateAttendance,
      response: {
        200: t.Number({ description: 'Number of updated rows' }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
export default fair
