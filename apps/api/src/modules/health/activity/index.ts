import betterAuth from '@api/modules/auth'
import Elysia, { status, t } from 'elysia'
import {
  getActivityStatuses,
  getActivityTypes,
  getAllieds,
  getSpecialities,
} from './catalogs-service'
import { ActivityModel } from './model'
import {
  createActivity,
  createAttention,
  createCompleteActivity,
  deleteActivities,
  getActivities,
  getActivityById,
  getActivityParticipants,
  getUserAttentions,
  setActivityUser,
  updateCompleteActivity,
} from './service'

const activityModule = new Elysia({ name: 'activity', prefix: '/activities' })
  .use(betterAuth)
  .post('', async ({ body }) => status(201, await createActivity(body)), {
    auth: true,
    body: ActivityModel.createActivity,
    response: { 201: t.Number(), 401: t.Literal('Unauthorized') },
  })
  .post(
    '/complete',
    async ({ body }) =>
      status(201, { activityId: await createCompleteActivity(body) }),
    {
      auth: true,
      body: ActivityModel.createCompleteActivity,
      response: {
        201: t.Object({ activityId: t.Number() }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .get('', ({ query }) => getActivities(query), {
    auth: true,
    query: ActivityModel.listActivitiesQuery,
    response: {
      200: ActivityModel.getActivitiesResponse,
      401: t.Literal('Unauthorized'),
    },
  })
  .get(
    '/:id',
    async ({ params }) => {
      const id = Number(params.id)
      if (Number.isNaN(id)) throw status(400, 'Invalid id')
      try {
        return await getActivityById(id)
      } catch (e) {
        if (e instanceof Error) throw status(404, e.message)
        throw e
      }
    },
    {
      auth: true,
      response: {
        200: t.Object({
          id: t.Number(),
          name: t.String(),
          date: t.String(),
          duration: t.String(),
          spaceId: t.String(),
          typeId: t.Number(),
          statusId: t.Number(),
          userId: t.String(),
          state: t.Boolean(),
          participants: t.Array(
            t.Object({
              alliedId: t.String(),
              specialityIds: t.Array(t.Number()),
            }),
          ),
        }),
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .put(
    '/:id/complete',
    async ({ params, body }) => {
      const id = Number(params.id)
      if (Number.isNaN(id)) throw status(400, 'Invalid id')
      return await updateCompleteActivity(id, body)
    },
    {
      auth: true,
      body: ActivityModel.createCompleteActivity,
      response: {
        200: t.Object({ id: t.Number() }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .delete('', ({ body }) => deleteActivities(body), {
    auth: true,
    body: ActivityModel.deleteActivities,
    response: {
      200: t.Object({
        deletedCount: t.Number(),
        deletedIds: t.Array(t.Number()),
      }),
      401: t.Literal('Unauthorized'),
    },
  })
  .get('/types', () => getActivityTypes(), {
    auth: true,
    response: {
      200: t.Array(t.Object({ id: t.Number(), name: t.String() })),
      401: t.Literal('Unauthorized'),
    },
  })
  .get('/statuses', () => getActivityStatuses(), {
    auth: true,
    response: {
      200: t.Array(t.Object({ id: t.Number(), name: t.String() })),
      401: t.Literal('Unauthorized'),
    },
  })
  .get('/allies', () => getAllieds(), {
    auth: true,
    response: {
      200: t.Array(t.Object({ id: t.String(), name: t.String() })),
      401: t.Literal('Unauthorized'),
    },
  })
  .get('/specialities', () => getSpecialities(), {
    auth: true,
    response: {
      200: t.Array(t.Object({ id: t.Number(), name: t.String() })),
      401: t.Literal('Unauthorized'),
    },
  })
  .get('/participants', ({ query }) => getActivityParticipants(query), {
    auth: true,
    query: ActivityModel.listParticipantsQuery,
    response: {
      200: ActivityModel.getParticipantsResponse,
      401: t.Literal('Unauthorized'),
    },
  })
  .get('/user-attentions', ({ query }) => getUserAttentions(query), {
    auth: true,
    query: ActivityModel.listUserAttentionsQuery,
    response: {
      200: ActivityModel.getUserAttentionsResponse,
      401: t.Literal('Unauthorized'),
    },
  })
  .post(
    '/attentions',
    async ({ body }) => status(201, await createAttention(body)),
    {
      auth: true,
      body: ActivityModel.createAttentionSchema,
      response: {
        201: ActivityModel.createAttentionResponse,
        400: t.Object({ error: t.String() }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .patch('/user-rewarded', ({ body }) => setActivityUser(body), {
    auth: true,
    body: ActivityModel.setActivityUserQuery,
    response: {
      200: ActivityModel.setActivityUserResponse,
      401: t.Literal('Unauthorized'),
    },
  })

export default activityModule
