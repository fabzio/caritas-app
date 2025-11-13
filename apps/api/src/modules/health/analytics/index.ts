import Elysia from 'elysia'
import { AnalyticsModel } from './model'
import { getActivityFilters, getAttentions } from './service'

export const analytics = new Elysia({
  prefix: '/analytics',
})
  .get(
    '/attentions',
    async ({ query }) =>
      await getAttentions({
        activityIds: query.activityIds
          ? query.activityIds.split(',').map(Number)
          : undefined,
        startDate: query.startDate,
        endDate: query.endDate,
        sex: query.sex,
        allied: query.allied,
        region: query.region,
      }),
    {
      query: AnalyticsModel.attentionsQuery,
      response: {
        200: AnalyticsModel.attentions,
      },
    },
  )
  .get('/filters/activities', getActivityFilters, {
    response: {
      200: AnalyticsModel.activityFilters,
    },
  })
