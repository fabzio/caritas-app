import { activity } from '@api/db/schemas/health'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace ActivityModel {
  const _getActivities = createSelectSchema(activity)
  const _createActivity = createInsertSchema(activity)

  export const listActivitySchema = t.Object({
    id: t.Integer(),
    name: t.String(),
    date: t.Date(),
    duration: t.String(),
    state: t.Boolean(),
    statusName: t.String(),
    typeName: t.String(),
    spaceName: t.String(),
    creatorName: t.String(),
  })

  export const listActivitiesQuery = t.Object({
    q: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()),
  })
  export type ListActivitiesQuery = typeof listActivitiesQuery.static

  export const getActivitiesResponse = t.Object({
    data: t.Array(listActivitySchema),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetActivities = typeof getActivitiesResponse.static

  export const getSingleActivityQuery = t.Object({
    id: t.String(),
  })

  export const getSingleActivityResponse = listActivitySchema
  export type GetSingleActivity = typeof getSingleActivityResponse.static

  export const createActivity = t.Omit(_createActivity, ['id'])
  export type CreateActivity = typeof createActivity.static

  export const activityParticipantSchema = t.Object({
    id: t.String(),
    name: t.String(),
    surname: t.Nullable(t.String()),
    documentType: t.Nullable(t.String()),
    documentNumber: t.Nullable(t.String()),
    email: t.String(),
    phone: t.Nullable(t.String()),
    rewarded: t.Boolean(),
  })

  export const listParticipantsQuery = t.Object({
    q: t.Optional(t.String()), // Búsqueda por nombre o documento
    activityId: t.String(),
  })
  export type ListParticipantsQuery = typeof listParticipantsQuery.static

  export const getParticipantsResponse = t.Array(activityParticipantSchema)
  export type GetParticipants = typeof getParticipantsResponse.static
}
