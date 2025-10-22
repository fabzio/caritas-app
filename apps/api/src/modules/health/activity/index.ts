import betterAuth from '@api/modules/auth'
import Elysia, { status, t } from 'elysia'
import { ActivityModel } from './model'
import {
  createActivity,
  getActivities,
  getActivityParticipants,
  getSingleActivity,
  getUserAttentions,
  setActivityUser,
} from './service'

const activityModule = new Elysia({
  name: 'activity',
  prefix: '/activities',
})
  .use(betterAuth)
  .post('', ({ body }) => createActivity(body), {
    auth: true,
    body: ActivityModel.createActivity,
    response: { 201: t.Number(), 401: t.Literal('Unauthorized') },
  })
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
      const result = await getSingleActivity(params.id)
      if (!result) throw status(404, 'Activity not found')
      return result
    },
    {
      auth: true,
      params: ActivityModel.getSingleActivityQuery,
      response: {
        200: ActivityModel.getSingleActivityResponse,
        404: t.Literal('Activity not found'),
        401: t.Literal('Unauthorized'),
      },
    },
  )
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
  .patch('/user-rewarded', ({ body }) => setActivityUser(body), {
    auth: true,
    body: ActivityModel.setActivityUserQuery,
    response: {
      200: ActivityModel.setActivityUserResponse,
      401: t.Literal('Unauthorized'),
    },
  })

export default activityModule
