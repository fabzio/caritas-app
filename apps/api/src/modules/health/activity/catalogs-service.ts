import db from '@api/db'
import { organization } from '@api/db/schemas/auth'
import {
  activityStatus,
  activityType,
  speciality,
} from '@api/db/schemas/health'
import { eq } from 'drizzle-orm'

export const getActivityTypes = async () => {
  return await db.select().from(activityType)
}

export const getActivityStatuses = async () => {
  return await db.select().from(activityStatus)
}

export const getAllieds = async () => {
  return await db
    .select({
      id: organization.id,
      name: organization.name,
    })
    .from(organization)
    .where(eq(organization.type, 'health'))
}

export const getSpecialities = async () => {
  return await db.select().from(speciality)
}
