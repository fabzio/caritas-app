import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization, user } from '@api/db/schemas/auth'
import {
  activity,
  activityStatus,
  activityType,
  activityUser,
  atention,
  speciality,
} from '@api/db/schemas/health'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
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

export async function getSingleActivity(
  activityId: string,
): Promise<ActivityModel.GetSingleActivity | null> {
  try {
    const activityIdNum = Number.parseInt(activityId, 10)

    const [result] = await db
      .select({
        id: activity.id,
        name: activity.name,
        date: activity.date,
        duration: activity.duration,
        state: activity.state,
        statusName: activityStatus.name,
        typeName: activityType.name,
        spaceName: organization.name,
        creatorName: user.name,
      })
      .from(activity)
      .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
      .innerJoin(activityType, eq(activity.typeId, activityType.id))
      .innerJoin(organization, eq(activity.spaceId, organization.id))
      .innerJoin(user, eq(activity.userId, user.id))
      .where(eq(activity.id, activityIdNum))
      .limit(1)

    if (!result) return null

    return {
      ...result,
      date: new Date(result.date),
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export async function getActivities(
  params: ActivityModel.ListActivitiesQuery,
): Promise<ActivityModel.GetActivities> {
  try {
    const { q = '', page = 0, limit = 10, sortBy = 'name.asc' } = params
    const searchQuery = q.replace(/\s+/g, ' ').trim()

    const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
    const sortField = (sortFieldRaw ?? 'name').trim()
    const sortOrder =
      (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

    const columnsMap = {
      name: activity.name,
      date: activity.date,
      status: activityStatus.name,
      type: activityType.name,
      space: organization.name,
    } as const

    const column =
      columnsMap[sortField as keyof typeof columnsMap] ?? activity.name
    const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

    const where = searchQuery
      ? or(
          ilike(activity.name, `%${searchQuery}%`),
          ilike(activityStatus.name, `%${searchQuery}%`),
          ilike(activityType.name, `%${searchQuery}%`),
          ilike(organization.name, `%${searchQuery}%`),
          ilike(user.name, `%${searchQuery}%`),
        )
      : undefined

    const [{ total }] = await db
      .select({ total: count(activity.id) })
      .from(activity)
      .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
      .innerJoin(activityType, eq(activity.typeId, activityType.id))
      .innerJoin(organization, eq(activity.spaceId, organization.id))
      .innerJoin(user, eq(activity.userId, user.id))
      .where(where)

    const totalPages = Math.ceil(total / limit)

    const rows = await db
      .select({
        id: activity.id,
        name: activity.name,
        date: activity.date,
        duration: activity.duration,
        state: activity.state,

        statusName: activityStatus.name,
        typeName: activityType.name,
        spaceName: organization.name,
        creatorName: user.name,
      })
      .from(activity)
      .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
      .innerJoin(activityType, eq(activity.typeId, activityType.id))
      .innerJoin(organization, eq(activity.spaceId, organization.id))
      .innerJoin(user, eq(activity.userId, user.id))
      .where(where)
      .offset(page * limit)
      .limit(limit)
      .orderBy(orderExpr)

    return {
      data: rows.map((row) => ({
        ...row,
        date: new Date(row.date),
      })),
      total,
      page,
      limit,
      totalPages,
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const getActivityParticipants = async (
  params: ActivityModel.ListParticipantsQuery,
): Promise<ActivityModel.GetParticipants> => {
  try {
    const { q = '', activityId } = params
    const searchQuery = q.replace(/\s+/g, ' ').trim()

    const searchCondition = searchQuery
      ? or(
          ilike(user.name, `%${searchQuery}%`),
          ilike(user.surname, `%${searchQuery}%`),
          ilike(user.documentNumber, `%${searchQuery}%`),
        )
      : undefined

    const activityIdNum = Number.parseInt(activityId, 10)
    const activityCondition = eq(activityUser.activityId, activityIdNum)
    const whereCondition = searchCondition
      ? and(activityCondition, searchCondition)
      : activityCondition

    const participants = await db
      .select({
        id: user.id,
        name: user.name,
        surname: user.surname,
        documentType: user.documentType,
        documentNumber: user.documentNumber,
        email: user.email,
        phone: user.phone,
        rewarded: activityUser.rewarded,
      })
      .from(activityUser)
      .innerJoin(user, eq(activityUser.userId, user.id))
      .where(whereCondition)
      .orderBy(asc(user.name))

    return participants
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const getUserAttentions = async (
  params: ActivityModel.ListUserAttentionsQuery,
): Promise<ActivityModel.GetUserAttentions> => {
  try {
    const { activityId, userId, q = '' } = params
    const activityIdNum = Number.parseInt(activityId, 10)
    const searchQuery = q.replace(/\s+/g, ' ').trim()

    const allSpecialities = await db
      .select({
        id: speciality.id,
        name: speciality.name,
      })
      .from(speciality)
      .where(
        searchQuery ? ilike(speciality.name, `%${searchQuery}%`) : undefined,
      )
      .orderBy(asc(speciality.name))

    const userAttentions = await db
      .select({
        id: atention.id,
        specialityId: atention.specialityId,
        timestamp: atention.timestamp,
        observations: atention.observations,
      })
      .from(atention)
      .where(
        and(
          eq(atention.activityId, activityIdNum),
          eq(atention.userId, userId),
        ),
      )

    const attentionMap = new Map(
      userAttentions.map((att) => [
        att.specialityId,
        {
          id: att.id,
          timestamp: att.timestamp,
          observations: att.observations,
        },
      ]),
    )

    const result = allSpecialities.map((spec) => {
      const attention = attentionMap.get(spec.id)
      return {
        specialityId: spec.id,
        specialityName: spec.name,
        hasAttention: !!attention,
        attentionId: attention?.id || null,
        attentionTime: attention?.timestamp
          ? attention.timestamp.toISOString()
          : null,
        observations: attention?.observations || null,
      }
    })

    return result
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const setActivityUser = async (
  params: ActivityModel.SetActivityUserQuery,
) => {
  const { userId, activityId, rewarded } = params
  try {
    await db
      .update(activityUser)
      .set({ rewarded })
      .where(
        and(
          eq(activityUser.activityId, activityId),
          eq(activityUser.userId, userId),
        ),
      )
    return { userId, activityId, rewarded }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
