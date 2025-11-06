import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization, region, user } from '@api/db/schemas/auth'
import {
  activity,
  activityStatus,
  activityType,
  activityUser,
  alliedParticipation,
  attention,
  speciality,
} from '@api/db/schemas/health'
import type { SQL } from 'drizzle-orm'
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  lte,
  ne,
  not,
  or,
  sql,
} from 'drizzle-orm'
import type { ActivityModel } from './model'

type ActivityUserFilter = ActivityModel.ListActivitiesQuery['user']

const buildRegisteredCondition = (userId: string) =>
  exists(
    db
      .select({ value: sql`1` })
      .from(activityUser)
      .where(
        and(
          eq(activityUser.activityId, activity.id),
          eq(activityUser.userId, userId),
        ),
      ),
  )

const buildAttentionCondition = (userId: string) =>
  exists(
    db
      .select({ value: sql`1` })
      .from(attention)
      .innerJoin(
        alliedParticipation,
        eq(attention.alliedParticipationId, alliedParticipation.id),
      )
      .where(
        and(
          eq(attention.userId, userId),
          eq(alliedParticipation.activityId, activity.id),
        ),
      ),
  )

const buildUserConditions = (
  filter: ActivityUserFilter,
  userId: string | undefined,
  today: string,
) => {
  if (!filter) return []
  if (!userId) throw new PostgresError('Usuario no encontrado')
  if (filter === 'active') return [ne(activityStatus.name, 'Cancelado')]
  const baseConditions = [buildRegisteredCondition(userId)]
  if (filter === 'participated')
    return [
      ...baseConditions,
      buildAttentionCondition(userId),
      lte(activity.date, today),
      ne(activityStatus.name, 'Cancelado'),
    ]
  if (filter === 'notParticipated')
    return [
      ...baseConditions,
      not(buildAttentionCondition(userId)),
      lte(activity.date, today),
      ne(activityStatus.name, 'Cancelado'),
    ]
  if (filter === 'canceled')
    return [...baseConditions, eq(activityStatus.name, 'Cancelado')]
  return baseConditions
}

const isCondition = <T extends SQL>(value: T | undefined): value is T =>
  value !== undefined

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
        regionName: region.name,
        creatorName: user.name,
      })
      .from(activity)
      .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
      .innerJoin(activityType, eq(activity.typeId, activityType.id))
      .innerJoin(region, eq(activity.regionId, region.id))
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
  userId?: string,
): Promise<ActivityModel.GetActivities> {
  try {
    const {
      q = '',
      page = 0,
      limit = 10,
      sortBy = 'name.asc',
      regionIds,
      startDate,
      endDate,
      user: userFilter,
    } = params
    const searchQuery = q.replaceAll(/\s+/g, ' ').trim()

    const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
    const sortField = (sortFieldRaw ?? 'name').trim()
    const sortOrder =
      (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

    const columnsMap = {
      name: activity.name,
      date: activity.date,
      status: activityStatus.name,
      type: activityType.name,
      region: region.name,
    } as const

    const column =
      columnsMap[sortField as keyof typeof columnsMap] ?? activity.name
    const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

    const searchConditions = searchQuery
      ? or(
          ilike(activity.name, `%${searchQuery}%`),
          ilike(activityStatus.name, `%${searchQuery}%`),
          ilike(activityType.name, `%${searchQuery}%`),
          ilike(region.name, `%${searchQuery}%`),
          ilike(user.name, `%${searchQuery}%`),
        )
      : undefined

    const regionIdsArray = regionIds
      ? regionIds.split(',').map((id) => Number.parseInt(id, 10))
      : []

    const regionCondition =
      regionIdsArray.length > 0
        ? or(...regionIdsArray.map((id) => eq(activity.regionId, id)))
        : undefined

    const dateConditions = [
      startDate ? gte(activity.date, startDate) : undefined,
      endDate ? lte(activity.date, endDate) : undefined,
    ].filter(isCondition)

    const today = new Date().toISOString().split('T')[0]
    const userConditions = buildUserConditions(userFilter, userId, today)

    const where = and(
      eq(activity.state, true),
      ...userConditions,
      ...dateConditions,
      ...(searchConditions ? [searchConditions] : []),
      ...(regionCondition ? [regionCondition] : []),
    )

    const [{ total }] = await db
      .select({ total: count(activity.id) })
      .from(activity)
      .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
      .innerJoin(activityType, eq(activity.typeId, activityType.id))
      .innerJoin(region, eq(activity.regionId, region.id))
      .innerJoin(user, eq(activity.userId, user.id))
      .where(where)

    const totalPages = Math.ceil(total / limit)

    const baseSelect = {
      id: activity.id,
      name: activity.name,
      date: activity.date,
      duration: activity.duration,
      state: activity.state,
      statusName: activityStatus.name,
      typeName: activityType.name,
      regionName: region.name,
      creatorName: user.name,
    }

    const selectFields = {
      ...baseSelect,
      ...(userFilter && userId
        ? { registered: buildRegisteredCondition(userId) }
        : {}),
    } satisfies typeof baseSelect & {
      registered?: ReturnType<typeof buildRegisteredCondition>
    }

    const rows = await db
      .select(selectFields)
      .from(activity)
      .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
      .innerJoin(activityType, eq(activity.typeId, activityType.id))
      .innerJoin(region, eq(activity.regionId, region.id))
      .innerJoin(user, eq(activity.userId, user.id))
      .where(where)
      .offset(page * limit)
      .limit(limit)
      .orderBy(orderExpr)

    const data = rows.map((row) => {
      const mappedRow = {
        ...row,
        date: new Date(row.date),
      }

      if (userFilter) {
        const { creatorName: _unusedCreator, ...rest } = mappedRow
        return {
          ...rest,
          registered: Boolean(mappedRow.registered),
        }
      }

      const { registered: _unusedRegistered, ...rest } = mappedRow
      return rest
    })

    return {
      data,
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
        .set({ state: false })
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
      throw new Error('Algunas organizaciones aliadas no existen')
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
          regionId: activityData.regionId,
          address: activityData.address,
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

export const getActivityDetailById = async (id: number) => {
  try {
    const [activityData] = await db
      .select({
        id: activity.id,
        name: activity.name,
        date: activity.date,
        duration: activity.duration,
        state: activity.state,
        statusName: activityStatus.name,
        typeName: activityType.name,
        address: activity.address,
        spaceName: organization.name,
        creatorName: user.name,
        regionName: region.name,
      })
      .from(activity)
      .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
      .innerJoin(activityType, eq(activity.typeId, activityType.id))
      .innerJoin(organization, eq(activity.spaceId, organization.id))
      .innerJoin(user, eq(activity.userId, user.id))
      .innerJoin(region, eq(region.id, activity.regionId))
      .where(eq(activity.id, id))
      .limit(1)

    if (!activityData) {
      throw new Error('Actividad no encontrada')
    }

    const attendants = await db
      .select({
        userId: activityUser.userId,
        userName: user.name,
        userBirthDate: user.birthDate,
        userSex: user.sex,
        district: region.name,
      })
      .from(activityUser)
      .innerJoin(user, eq(activityUser.userId, user.id))
      .innerJoin(region, eq(user.regionId, region.id))
      .where(eq(activityUser.activityId, id))

    const attendantsList = attendants.map((u) => ({
      ...u,
      userBirthDate: new Date(u.userBirthDate as unknown as string | Date)
        .toISOString()
        .split('T')[0],
    }))

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
      attendants: attendantsList,
    }

    return result
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
        regionId: activity.regionId,
        address: activity.address,
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
      throw new Error('Algunas organizaciones aliadas no existen')
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
          regionId: activityData.regionId,
          address: activityData.address,
          statusId: activityData.statusId,
          typeId: activityData.typeId,
          userId: activityData.userId,
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
    const searchQuery = q.replaceAll(/\s+/g, ' ').trim()

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
    const searchQuery = q.replaceAll(/\s+/g, ' ').trim()

    const participatingSpecialities = await db
      .select({
        alliedParticipationId: alliedParticipation.id,
        specialityId: speciality.id,
        specialityName: speciality.name,
        alliedId: organization.id,
        alliedName: organization.name,
      })
      .from(alliedParticipation)
      .innerJoin(
        speciality,
        eq(alliedParticipation.specialityId, speciality.id),
      )
      .innerJoin(
        organization,
        eq(alliedParticipation.alliedId, organization.id),
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
        alliedId: spec.alliedId,
        alliedName: spec.alliedName,
        alliedParticipationId: spec.alliedParticipationId,
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

export const createAttention = async (
  args: ActivityModel.CreateAttention,
): Promise<ActivityModel.CreateAttentionResponse> => {
  try {
    const { userId, alliedParticipationId, observations, registeredBy } = args

    const [newAttention] = await db
      .insert(attention)
      .values({
        userId,
        alliedParticipationId,
        observations,
        registeredBy,
      })
      .returning({
        id: attention.id,
        userId: attention.userId,
        alliedParticipationId: attention.alliedParticipationId,
        observations: attention.observations,
        registeredBy: attention.registeredBy,
        timestamp: attention.timestamp,
      })

    return newAttention
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
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

export const addAttendantToActivity = async (
  params: ActivityModel.AttendantActivity,
) => {
  const { userId, activityId } = params
  try {
    await db.insert(activityUser).values({
      activityId,
      userId,
    })
    return { userId, activityId }
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const removeAttendantFromActivity = async (
  params: ActivityModel.AttendantActivity,
) => {
  const { userId, activityId } = params
  try {
    await db
      .delete(activityUser)
      .where(
        and(
          eq(activityUser.activityId, activityId),
          eq(activityUser.userId, userId),
        ),
      )
    return { userId, activityId }
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const getRegionsWithActivities = async () => {
  try {
    const regions = await db
      .selectDistinct({
        id: region.id,
        name: region.name,
      })
      .from(activity)
      .innerJoin(region, eq(activity.regionId, region.id))
      .where(eq(activity.state, true))
      .orderBy(asc(region.name))

    return regions
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const getExistentUsers = async (
  params: ActivityModel.ListExistentUsersQuery,
): Promise<ActivityModel.ExistentUser> => {
  try {
    const { documentType = '', documentNumber = '' } = params
    const conditions = []
    if (documentType) {
      conditions.push(eq(user.documentType, documentType))
    }
    if (documentNumber) {
      conditions.push(ilike(user.documentNumber, `%${documentNumber}%`))
    }
    conditions.push(eq(user.active, true), eq(user.role, 'user'))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        surname: user.surname,
        documentType: user.documentType,
        documentNumber: user.documentNumber,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        sex: user.sex,
        regionId: user.regionId,
      })
      .from(user)
      .orderBy(asc(user.name))
      .limit(5)
      .where(where)

    return {
      data: users.map((u) => ({
        ...u,
        birthDate: new Date(u.birthDate),
      })),
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export async function findDuplicateAttendant(
  userId: string,
  activityId: number,
) {
  const existentUsers = await db
    .select()
    .from(activityUser)
    .where(
      and(
        eq(activityUser.activityId, activityId),
        eq(activityUser.userId, userId),
      ),
    )

  return existentUsers.length > 0
}
