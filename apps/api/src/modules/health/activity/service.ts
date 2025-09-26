import db from '@/db'
import { PostgresError } from '@/db/errors'
import { activity } from '@/db/schemas/health'
import type { ActivityModel } from './model'

export const createActivity = async (args: ActivityModel.CreateActivity) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx.insert(activity).values(args).returning({
        id: activity.id,
      })
    })
    return id
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const getActivities = async (): Promise<ActivityModel.GetActivities> => {
  try {
    return await db.query.activity.findMany({
      columns: {
        createdAt: false,
        updatedAt: false,
      },
    })
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
