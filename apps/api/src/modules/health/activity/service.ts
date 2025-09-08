import db from '@/db'
import { activity } from '@/db/schemas/health'
import type { ActivityModel } from './model'

export const createActivity = async (args: ActivityModel.CreateActivity) => {
  const [{ id }] = await db.transaction(async (tx) => {
    return await tx.insert(activity).values(args).returning({
      id: activity.id,
    })
  })
  return id
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
    console.log(e)
    throw e
  }
}
