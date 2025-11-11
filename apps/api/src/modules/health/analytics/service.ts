import db from '@api/db'
import { attentionFact } from '@api/db/views/attention-facts'
import { and, eq, gt, inArray, lt } from 'drizzle-orm'
import type { AnalyticsModel } from './model'

export const getAttentions = async (params: {
  activityIds?: number[]
  startDate?: string
  endDate?: string
  sex?: 'M' | 'F'
  allied?: string
  region?: string
}): Promise<AnalyticsModel.Attentions> => {
  const conditions = []
  if (params.activityIds)
    conditions.push(inArray(attentionFact.activityId, params.activityIds))
  if (params.startDate)
    conditions.push(gt(attentionFact.activityDate, params.startDate))
  if (params.endDate)
    conditions.push(lt(attentionFact.activityDate, params.endDate))
  if (params.sex) conditions.push(eq(attentionFact.patientSex, params.sex))
  if (params.allied)
    conditions.push(eq(attentionFact.alliedOrganization, params.allied))
  if (params.region)
    conditions.push(eq(attentionFact.activityRegion, params.region))
  const attentions = await db
    .select()
    .from(attentionFact)
    .where(and(conditions.length ? and(...conditions) : undefined))
  return attentions.map((attention) => ({
    ...attention,
    activityDate: new Date(attention.activityDate),
  }))
}

export const getActivityFilters = async () => {
  const activities = await db
    .select({
      activityId: attentionFact.activityId,
      activityName: attentionFact.activityName,
    })
    .from(attentionFact)
    .groupBy(attentionFact.activityId, attentionFact.activityName)

  return activities
}
