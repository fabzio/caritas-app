// apps/api/src/modules/health/activity/index.ts

import Elysia, { t } from 'elysia'
import { ActivityModel } from './model'
import { createActivity, getActivities } from './service'

const activityModule = new Elysia({
  name: 'activity',
  prefix: '/activities',
})
  // Endpoint para CREAR una nueva actividad (POST)
  .post('', ({ body }) => createActivity(body), {
    body: ActivityModel.createActivity,
    response: { 201: t.Number() }, // Devuelve el ID de la actividad creada
  })
  // Endpoint para LISTAR actividades (GET)
  .get('', ({ query }) => getActivities(query), {
    query: ActivityModel.listActivitiesQuery,
    response: {
      200: ActivityModel.getActivitiesResponse,
    },
  })

export default activityModule
