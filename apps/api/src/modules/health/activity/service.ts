import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization, user } from '@api/db/schemas/auth'
import {
  activity,
  activityStatus,
  activityType,
  activityUser,
  alliedParticipation,
  attention,
  speciality,
} from '@api/db/schemas/health'
import { addDays } from 'date-fns' // o similar
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  lt,
  lte,
  or,
  type SQL,
} from 'drizzle-orm'
import type { ActivityModel } from './model'

const getNextDay = (dateString: string) => {
  const date = new Date(dateString)
  const nextDay = addDays(date, 1)
  return nextDay.toISOString().split('T')[0]
}

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
    const {
      q = '',
      page = 0,
      limit = 10,
      sortBy = 'name.asc',
      startDate,
      endDate,
    } = params
    const searchQuery = q.replace(/\s+/g, ' ').trim()
    const dateRangeConditions: SQL[] = []
    const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
    const sortField = (sortFieldRaw ?? 'name').trim()
    const sortOrder =
      (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

    if (startDate) {
      dateRangeConditions.push(gt(activity.date, startDate))
    }
    if (endDate) {
      // 1. Obtén el día siguiente al endDate
      const nextDay = getNextDay(endDate)

      // 2. Usa MENOR QUE (lt) el inicio del día siguiente
      // Esto incluye todas las horas del endDate
      dateRangeConditions.push(lte(activity.date, nextDay))
    }

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

    const searchConditions = searchQuery
      ? or(
          ilike(activity.name, `%${searchQuery}%`),
          ilike(activityStatus.name, `%${searchQuery}%`),
          ilike(activityType.name, `%${searchQuery}%`),
          ilike(organization.name, `%${searchQuery}%`),
          ilike(user.name, `%${searchQuery}%`),
        )
      : undefined

    const allConditions = [
      eq(activity.state, true),
      ...dateRangeConditions,
      ...(searchConditions ? [searchConditions] : []),
    ]

    const where = and(...allConditions)

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

export const deleteActivities = async (
  args: ActivityModel.DeleteActivities,
) => {
  try {
    const { ids } = args

    const existingActivities = await db
      .select({ id: activity.id })
      .from(activity)
      .where(
        and(
          eq(activity.state, true),
          or(...ids.map((id) => eq(activity.id, id))),
        ),
      )

    if (existingActivities.length === 0) {
      throw new Error(
        'No se encontraron actividades activas con los IDs proporcionados',
      )
    }

    if (existingActivities.length !== ids.length) {
      throw new Error('Algunos IDs no existen o ya están eliminados')
    }

    const result = await db.transaction(async (tx) => {
      return await tx
        .update(activity)
        .set({ state: false, updatedAt: new Date() })
        .where(or(...ids.map((id) => eq(activity.id, id))))
        .returning({ id: activity.id })
    })

    return {
      deletedCount: result.length,
      deletedIds: result.map((r) => r.id),
    }
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const createCompleteActivity = async (
  args: ActivityModel.CreateCompleteActivity,
) => {
  try {
    const { participants, ...activityData } = args

    const alliedIds = [...new Set(participants.map((p) => p.alliedId))]
    const allSpecialityIds = [
      ...new Set(participants.flatMap((p) => p.specialityIds)),
    ]

    const [allies, specialities] = await Promise.all([
      db
        .select({ id: organization.id })
        .from(organization)
        .where(or(...alliedIds.map((id) => eq(organization.id, id)))),
      db
        .select({ id: speciality.id })
        .from(speciality)
        .where(or(...allSpecialityIds.map((id) => eq(speciality.id, id)))),
    ])

    if (allies.length !== alliedIds.length) {
      throw new Error('Algunos aliados no existen')
    }

    if (specialities.length !== allSpecialityIds.length) {
      throw new Error('Algunas especialidades no existen')
    }

    const result = await db.transaction(async (tx) => {
      const [createdActivity] = await tx
        .insert(activity)
        .values({
          name: activityData.name,
          date: activityData.date.toISOString().split('T')[0],
          duration: activityData.duration,
          spaceId: activityData.spaceId,
          statusId: activityData.statusId,
          typeId: activityData.typeId,
          userId: activityData.userId,
          state: true,
        })
        .returning({ id: activity.id })
      const participationRecords = participants.flatMap((participant) =>
        participant.specialityIds.map((specialityId) => ({
          activityId: createdActivity.id,
          alliedId: participant.alliedId,
          specialityId,
        })),
      )

      await tx.insert(alliedParticipation).values(participationRecords)

      return createdActivity
    })

    return result.id
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const getActivityById = async (id: number) => {
  try {
    const [activityData] = await db
      .select({
        id: activity.id,
        name: activity.name,
        date: activity.date,
        duration: activity.duration,
        spaceId: activity.spaceId,
        typeId: activity.typeId,
        statusId: activity.statusId,
        userId: activity.userId,
        state: activity.state,
      })
      .from(activity)
      .where(and(eq(activity.id, id), eq(activity.state, true)))

    if (!activityData) {
      throw new Error('Actividad no encontrada')
    }

    const participations = await db
      .select({
        alliedId: alliedParticipation.alliedId,
        specialityId: alliedParticipation.specialityId,
      })
      .from(alliedParticipation)
      .where(eq(alliedParticipation.activityId, id))

    const participantsMap = new Map<
      string,
      { alliedId: string; specialityIds: number[] }
    >()

    for (const p of participations) {
      if (!participantsMap.has(p.alliedId)) {
        participantsMap.set(p.alliedId, {
          alliedId: p.alliedId,
          specialityIds: [],
        })
      }
      const participant = participantsMap.get(p.alliedId)
      if (participant) {
        participant.specialityIds.push(p.specialityId)
      }
    }

    const result = {
      ...activityData,
      date: new Date(activityData.date as unknown as string | Date)
        .toISOString()
        .split('T')[0],
      participants: Array.from(participantsMap.values()),
    }

    return result
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const updateCompleteActivity = async (
  id: number,
  args: ActivityModel.CreateCompleteActivity,
) => {
  try {
    const { participants, ...activityData } = args

    const alliedIds = [...new Set(participants.map((p) => p.alliedId))]
    const allSpecialityIds = [
      ...new Set(participants.flatMap((p) => p.specialityIds)),
    ]

    const [allies, specialities] = await Promise.all([
      db
        .select({ id: organization.id })
        .from(organization)
        .where(or(...alliedIds.map((aid) => eq(organization.id, aid)))),
      db
        .select({ id: speciality.id })
        .from(speciality)
        .where(or(...allSpecialityIds.map((sid) => eq(speciality.id, sid)))),
    ])

    if (allies.length !== alliedIds.length) {
      throw new Error('Algunos aliados no existen')
    }

    if (specialities.length !== allSpecialityIds.length) {
      throw new Error('Algunas especialidades no existen')
    }

    await db.transaction(async (tx) => {
      await tx
        .update(activity)
        .set({
          name: activityData.name,
          date: activityData.date.toISOString().split('T')[0],
          duration: activityData.duration,
          spaceId: activityData.spaceId,
          statusId: activityData.statusId,
          typeId: activityData.typeId,
          userId: activityData.userId,
          updatedAt: new Date(),
        })
        .where(eq(activity.id, id))

      await tx
        .delete(alliedParticipation)
        .where(eq(alliedParticipation.activityId, id))

      const participationRecords = participants.flatMap((participant) =>
        participant.specialityIds.map((specialityId) => ({
          activityId: id,
          alliedId: participant.alliedId,
          specialityId,
        })),
      )

      await tx.insert(alliedParticipation).values(participationRecords)
    })

    return { id }
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
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

    const participatingSpecialities = await db
      .select({
        alliedParticipationId: alliedParticipation.id,
        specialityId: speciality.id,
        specialityName: speciality.name,
      })
      .from(alliedParticipation)
      .innerJoin(
        speciality,
        eq(alliedParticipation.specialityId, speciality.id),
      )
      .where(
        and(
          eq(alliedParticipation.activityId, activityIdNum),
          searchQuery ? ilike(speciality.name, `%${searchQuery}%`) : undefined,
        ),
      )
      .orderBy(asc(speciality.name))

    const userAttentions = await db
      .select({
        id: attention.id,
        alliedParticipationId: attention.alliedParticipationId,
        timestamp: attention.timestamp,
        observations: attention.observations,
      })
      .from(attention)
      .where(eq(attention.userId, userId))

    const attentionMap = new Map(
      userAttentions.map((att) => [
        att.alliedParticipationId,
        {
          id: att.id,
          timestamp: att.timestamp,
          observations: att.observations,
        },
      ]),
    )

    const result = participatingSpecialities.map((spec) => {
      const att = attentionMap.get(spec.alliedParticipationId)
      return {
        specialityId: spec.specialityId,
        specialityName: spec.specialityName,
        hasAttention: !!att,
        attentionId: att?.id || null,
        attentionTime: att?.timestamp ? att.timestamp.toISOString() : null,
        observations: att?.observations || null,
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
