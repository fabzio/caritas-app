import { activity } from '@api/db/schemas/health'
import { createInsertSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace ActivityModel {
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
    q: t.Optional(t.String()),
    activityId: t.String(),
  })
  export type ListParticipantsQuery = typeof listParticipantsQuery.static

  export const getParticipantsResponse = t.Array(activityParticipantSchema)
  export type GetParticipants = typeof getParticipantsResponse.static

  export const userAttentionSchema = t.Object({
    specialityId: t.Integer(),
    specialityName: t.String(),
    hasAttention: t.Boolean(),
    attentionId: t.Nullable(t.Integer()),
    attentionTime: t.Nullable(t.String()),
    observations: t.Nullable(t.String()),
  })

  export const listUserAttentionsQuery = t.Object({
    activityId: t.String(),
    userId: t.String(),
    q: t.Optional(t.String()),
  })

  export const setActivityUserQuery = t.Object({
    userId: t.String(),
    activityId: t.Integer(),
    rewarded: t.Boolean(),
  })

  export const setActivityUserResponse = t.Object({
    userId: t.String(),
    activityId: t.Integer(),
    rewarded: t.Boolean(),
  })

  export type SetActivityUserQuery = typeof setActivityUserQuery.static
  export type ListUserAttentionsQuery = typeof listUserAttentionsQuery.static

  export const getUserAttentionsResponse = t.Array(userAttentionSchema)
  export type GetUserAttentions = typeof getUserAttentionsResponse.static
  export const deleteActivities = t.Object({
    ids: t.Array(t.Integer({ minimum: 1 }), { minItems: 1 }),
  })
  export type DeleteActivities = typeof deleteActivities.static

  export const createCompleteActivity = t.Object({
    name: t.String({ minLength: 1, maxLength: 100 }),
    date: t.Date(),
    duration: t.String(),
    description: t.Optional(t.String({ maxLength: 500 })),
    spaceId: t.String({ minLength: 32, maxLength: 32 }),
    statusId: t.Integer({ minimum: 1, maximum: 6 }),
    typeId: t.Integer({ minimum: 1, maximum: 2 }),
    userId: t.String({ minLength: 32, maxLength: 32 }),
    participants: t.Array(
      t.Object({
        alliedId: t.String({ minLength: 32, maxLength: 32 }),
        specialityIds: t.Array(t.Integer({ minimum: 1 }), { minItems: 1 }),
      }),
      { minItems: 1 },
    ),
  })
  export type CreateCompleteActivity = typeof createCompleteActivity.static

  export const attendantActivity = t.Object({
    userId: t.String(),
    activityId: t.Number(),
  })
  export type AttendantActivity = typeof attendantActivity.static
}
