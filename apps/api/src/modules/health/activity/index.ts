// apps/api/src/modules/health/activity/index.ts
import betterAuth from '@api/modules/auth'
import Elysia, { t } from 'elysia'
import {
  getActivityStatuses,
  getActivityTypes,
  getAllieds,
  getSpecialities,
} from './catalogs-service'
import { ActivityModel } from './model'
import {
  createActivity,
  createCompleteActivity,
  deleteActivities,
  getActivities,
} from './service'

const activityModule = new Elysia({
  name: 'activity',
  prefix: '/activities',
})
  .use(betterAuth)
  // Endpoint para CREAR una nueva actividad (POST)
  .post(
    '',
    async ({ body, set }) => {
      try {
        const id = await createActivity(body)
        set.status = 201
        return id
      } catch (error) {
        if (error instanceof Error) {
          set.status = 400
          return { error: error.message }
        }
        throw error
      }
    },
    {
      auth: true,
      body: ActivityModel.createActivity,
      response: {
        201: t.Number(),
        400: t.Object({ error: t.String() }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  // Endpoint para CREAR una actividad completa con participantes (POST)
  .post(
    '/complete',
    async ({ body, set }) => {
      try {
        const id = await createCompleteActivity(body)
        set.status = 201
        return { activityId: id }
      } catch (error) {
        if (error instanceof Error) {
          set.status = 400
          return { error: error.message }
        }
        throw error
      }
    },
    {
      auth: true,
      body: ActivityModel.createCompleteActivity,
      response: {
        201: t.Object({ activityId: t.Number() }),
        400: t.Object({ error: t.String() }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  // Endpoint para LISTAR actividades (GET)
  .get('', ({ query }) => getActivities(query), {
    auth: true,
    query: ActivityModel.listActivitiesQuery,
    response: {
      200: ActivityModel.getActivitiesResponse,
      401: t.Literal('Unauthorized'),
    },
  })
  // Endpoint para ELIMINAR actividades (DELETE) - Eliminación lógica
  .delete(
    '',
    async ({ body, set }) => {
      try {
        const result = await deleteActivities(body)
        set.status = 200
        return result
      } catch (error) {
        if (error instanceof Error) {
          set.status = 400
          return { error: error.message }
        }
        throw error
      }
    },
    {
      auth: true,
      body: ActivityModel.deleteActivities,
      response: {
        200: t.Object({
          deletedCount: t.Number(),
          deletedIds: t.Array(t.Number()),
        }),
        400: t.Object({ error: t.String() }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  // Endpoint para obtener tipos de actividad
  .get('/types', () => getActivityTypes(), {
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
  // Endpoint para obtener estados de actividad
  .get('/statuses', () => getActivityStatuses(), {
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
  // Endpoint para obtener aliados (organizaciones tipo allied)
  .get('/allies', () => getAllieds(), {
    auth: true,
    response: {
      200: t.Array(
        t.Object({
          id: t.String(),
          name: t.String(),
        }),
      ),
      401: t.Literal('Unauthorized'),
    },
  })
  // Endpoint para obtener especialidades
  .get('/specialities', () => getSpecialities(), {
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

export default activityModule
