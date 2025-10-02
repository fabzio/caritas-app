import { activity } from '@api/db/schemas/health'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace ActivityModel {
  const _getActivities = createSelectSchema(activity)
  export const getActivities = t.Array(
    t.Omit(_getActivities, ['createdAt', 'updatedAt']),
  )
  export type GetActivities = typeof getActivities.static

  const _createActivity = createInsertSchema(activity)
  export const createActivity = t.Omit(_createActivity, ['id'])
  export type CreateActivity = typeof createActivity.static
}
