// apps/api/src/modules/health/activity/index.ts
import betterAuth from '@api/modules/auth'
import Elysia, { t } from 'elysia'
import { ActivityModel } from './model'
import { createActivity, getActivities } from './service'

const activityModule = new Elysia({
  name: 'activity',
  prefix: '/activities',
})
  // Endpoint para CREAR una nueva actividad (POST)
  .use(betterAuth)
  .post('', ({ body }) => createActivity(body), {
    auth: true,
    body: ActivityModel.createActivity,
    response: { 201: t.Number(), 401: t.Literal('Unauthorized') }, // Devuelve el ID de la actividad creada
  })
  // Endpoint para LISTAR actividades (GET)
  .get('', ({ query }) => getActivities(query), {
    auth: true,
    query: ActivityModel.listActivitiesQuery,
    response: {
      200: ActivityModel.getActivitiesResponse,
      401: t.Literal('Unauthorized'),
    },
  })

export default activityModule
