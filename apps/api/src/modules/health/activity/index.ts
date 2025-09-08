import Elysia, { t } from 'elysia'
import betterAuth from '@/modules/auth'
import { ActivityModel } from './model'
import { createActivity, getActivities } from './service'

export const activity = new Elysia({
  name: 'activity',
  prefix: '/activity',
})
  .use(betterAuth)
  .get('', getActivities, {
    auth: true,
    response: {
      200: ActivityModel.getActivities,
      401: t.Literal('Unauthorized'),
    },
  })
  .post('', ({ body }) => createActivity(body), {
    auth: true,
    body: ActivityModel.createActivity,
    response: {
      200: t.Number({
        description: 'ID of the created activity',
      }),
      401: t.Literal('Unauthorized'),
    },
  })
