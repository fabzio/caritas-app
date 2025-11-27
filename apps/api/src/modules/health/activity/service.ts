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
  patientInfo,
  speciality,
} from '@api/db/schemas/health'
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  lte,
  ne,
  not,
  or,
  type SQL,
  type SQLWrapper,
  sql,
  sum,
} from 'drizzle-orm'
import * as ExcelJS from 'exceljs'
import { writeFileSync } from 'fs'
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

export const getSingleUserActivity = async (
  userId: string,
): Promise<ActivityModel.SingleUserActivity | null> => {
  const [userData] = await db
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
      insuranceType: patientInfo.insuranceType,
    })
    .from(user)
    .leftJoin(patientInfo, eq(user.id, patientInfo.userId))
    .where(eq(user.id, userId))
    .limit(1)

  if (!userData) return null

  return {
    data: {
      ...userData,
      birthDate: new Date(userData.birthDate),
      insuranceType: userData.insuranceType ?? 'none',
    },
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
        insuranceType: patientInfo.insuranceType,
      })
      .from(user)
      .leftJoin(patientInfo, eq(user.id, patientInfo.userId))
      .orderBy(asc(user.name))
      .limit(5)
      .where(where)

    return {
      data: users.map((u) => ({
        ...u,
        birthDate: new Date(u.birthDate),
        insuranceType: u.insuranceType ?? 'none',
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

export async function getDetailedActivitiesByIds(ids: number[]) {
  if (ids.length === 0) return []

  // 1. Obtener los datos principales de las actividades
  const activities = await db
    .select({
      id: activity.id,
      name: activity.name,
      date: activity.date,
      duration: activity.duration,
      address: activity.address,
      statusName: activityStatus.name,
      typeName: activityType.name,
      spaceName: organization.name,
      creatorName: user.name,
      regionName: region.name, // DISTRITO de la actividad
    })
    .from(activity)
    .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
    .innerJoin(activityType, eq(activity.typeId, activityType.id))
    .innerJoin(organization, eq(activity.spaceId, organization.id))
    .innerJoin(user, eq(activity.userId, user.id)) // Creador
    .innerJoin(region, eq(region.id, activity.regionId))
    .where(and(inArray(activity.id, ids), eq(activity.state, true)))

  const activityIds = activities.map((a) => a.id)

  const allParticipations = await db
    .select({
      activityId: alliedParticipation.activityId,
      alliedName: organization.name, // Nombre del Aliado
      specialityName: speciality.name, // Nombre de la Especialidad
    })
    .from(alliedParticipation)
    .innerJoin(organization, eq(alliedParticipation.alliedId, organization.id))
    .innerJoin(speciality, eq(alliedParticipation.specialityId, speciality.id))
    .where(inArray(alliedParticipation.activityId, activityIds))

  const activityMap = new Map(
    activities.map((a) => [
      a.id,
      {
        ...a,
        participations: [] as ActivityModel.ParticipationDetail[],
      },
    ]),
  )

  allParticipations.forEach((p) => {
    const detail = activityMap.get(p.activityId)
    if (detail) {
      detail.participations.push({
        alliedName: p.alliedName,
        specialityName: p.specialityName,
      })
    }
  })

  return Array.from(activityMap.values())
}
export async function getParticipantDistricts(
  activityIds: number[],
): Promise<string[]> {
  if (activityIds.length === 0) return []

  const uniqueDistricts = await db
    .selectDistinct({
      name: region.name,
    })
    .from(activityUser)
    .innerJoin(user, eq(activityUser.userId, user.id))
    .innerJoin(region, eq(user.regionId, region.id))
    .where(inArray(activityUser.activityId, activityIds))

  return uniqueDistricts.map((d) => d.name.toUpperCase().trim())
}
export async function getActivityDemographics(activityIds: number[]) {
  if (activityIds.length === 0) return new Map()

  const currentYear = new Date().getFullYear()
  const resultsMap = new Map()

  const countsByDistrict = await db
    .select({
      activityId: activityUser.activityId,
      districtName: region.name,
      countByDistrict: count(user.id).mapWith(Number),
    })
    .from(activityUser)
    .innerJoin(user, eq(activityUser.userId, user.id))
    .innerJoin(region, eq(user.regionId, region.id))
    .where(inArray(activityUser.activityId, activityIds))
    .groupBy(activityUser.activityId, region.name)

  countsByDistrict.forEach((row: any) => {
    const activityId = row.activityId
    const districtKey = row.districtName.toUpperCase().trim()

    if (!resultsMap.has(activityId)) {
      resultsMap.set(activityId, {
        districtCounts: {},
      })
    }

    const currentCounts = resultsMap.get(activityId).districtCounts

    currentCounts[districtKey] =
      (currentCounts[districtKey] || 0) + row.countByDistrict
  })

  const totalCountsResult = await db
    .select({
      activityId: activityUser.activityId,
      totalAsistentes: count(activityUser.userId).mapWith(Number),
      countF: sum(sql`CASE WHEN ${user.sex} = 'F' THEN 1 ELSE 0 END`).mapWith(
        Number,
      ),
      countM: sum(sql`CASE WHEN ${user.sex} = 'M' THEN 1 ELSE 0 END`).mapWith(
        Number,
      ),
      countMenores18: sum(
        sql`CASE WHEN (${currentYear} - EXTRACT(YEAR FROM ${user.birthDate})) < 18 THEN 1 ELSE 0 END`,
      ).mapWith(Number),
      count18a64: sum(
        sql`CASE WHEN (${currentYear} - EXTRACT(YEAR FROM ${user.birthDate})) >= 18 AND (${currentYear} - EXTRACT(YEAR FROM ${user.birthDate})) <= 64 THEN 1 ELSE 0 END`,
      ).mapWith(Number),
      count65Mas: sum(
        sql`CASE WHEN (${currentYear} - EXTRACT(YEAR FROM ${user.birthDate})) >= 65 THEN 1 ELSE 0 END`,
      ).mapWith(Number),
      countPublico: sum(
        sql`CASE WHEN ${patientInfo.insuranceType} = 'public' THEN 1 ELSE 0 END`,
      ).mapWith(Number),
      countPrivado: sum(
        sql`CASE WHEN ${patientInfo.insuranceType} = 'private' THEN 1 ELSE 0 END`,
      ).mapWith(Number),
      countOtrosSeguros: sum(
        sql`CASE WHEN ${patientInfo.insuranceType} NOT IN ('public', 'private') OR ${patientInfo.insuranceType} IS NULL THEN 1 ELSE 0 END`,
      ).mapWith(Number),
    })
    .from(activityUser)
    .innerJoin(user, eq(activityUser.userId, user.id))
    .innerJoin(patientInfo, eq(patientInfo.userId, activityUser.userId))
    .where(inArray(activityUser.activityId, activityIds))
    .groupBy(activityUser.activityId)

  totalCountsResult.forEach((row: any) => {
    const activityId = row.activityId
    const data = resultsMap.get(activityId)

    if (data) {
      resultsMap.set(activityId, {
        ...data,
        totalAsistentes: row.totalAsistentes,
        countF: row.countF,
        countM: row.countM,
        countMenores18: row.countMenores18,
        count18a64: row.count18a64,
        count65Mas: row.count65Mas,
        countPublico: row.countPublico,
        countPrivado: row.countPrivado,
        countOtrosSeguros: row.countOtrosSeguros,
      })
    }
  })

  return resultsMap
}
const toDetailedCsv = (
  mergedData: any[],
  dynamicDistrictHeaders: string[],
): string => {
  if (mergedData.length === 0)
    return 'Mensaje\nNo hay actividades para exportar\n'

  // Definición de encabezados
  const headers = [
    'N°',
    'ACTIVIDAD',
    'DISTRITO',
    'ORGANIZACIÓN',
    'LUGAR',
    'FECHA',
    'DURACIÓN DE IES',
    'ALIADOS',
    'ESPECIALIDADES',
    'CANTIDAD DE PERSONAS REGISTRADAS',
    'F',
    'M',
    'MENORES DE 18',
    '18 A 64',
    '65 A MÁS',
    ...dynamicDistrictHeaders, // Distritos Dinámicos
    'PÚBLICO',
    'PRIVADO',
    'NINGUNO',
  ]
  let csvContent = `${headers.join(',')}\n`

  mergedData.forEach((activity) => {
    const { demographics } = activity
    const participations =
      activity.participations && activity.participations.length > 0
        ? activity.participations
        : [{ alliedName: 'N/A', specialityName: 'N/A' }]

    participations.forEach((p: any) => {
      const districtCountsRow = dynamicDistrictHeaders.map(
        (header) => demographics.districtCounts[header] || 0,
      )

      const baseRow = [
        activity.id,
        `"${activity.name}"`,
        activity.regionName, // Distrito de la actividad
        `"${activity.spaceName}"`,
        `"${activity.address}"`,
        new Date(activity.date).toISOString().split('T')[0],
        activity.duration,
        `"${p.alliedName}"`,
        `"${p.specialityName}"`,
        demographics.totalAsistentes,
        demographics.countF,
        demographics.countM,
        demographics.countMenores18,
        demographics.count18a64,
        demographics.count65Mas,
        ...districtCountsRow, // Columnas de distritos
        demographics.countPublico,
        demographics.countPrivado,
        demographics.countOtrosSeguros,
      ]
      csvContent += `${baseRow.join(',')}\n`
    })
  })

  return csvContent
}
export const toDetailedXlsx = async (
  mergedData: any[],
  dynamicDistrictHeaders: string[],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Reporte Detallado')

  const fixedHeaders = [
    'N°',
    'ACTIVIDAD',
    'DISTRITO',
    'ESAC INVOLUCRADAS',
    'LUGAR',
    'FECHA',
    'DURACIÓN DE IES',
  ]
  const demographyHeaders = [
    'TOTAL REGISTRADOS',
    'F',
    'M',
    'MENORES DE 18',
    '18 A 64',
    '65 A MÁS',
  ]
  const insuranceHeaders = ['PÚBLICO', 'PRIVADO', 'NINGUNO']
  const participationHeaders = ['ALIADOS', 'ESPECIALIDADES']

  const ALIED_COL_INDEX = fixedHeaders.length + 1 // Columna H
  const DEMO_START_COL_INDEX =
    fixedHeaders.length + participationHeaders.length + 1 // Columna J

  const columnNamesRow2 = [
    ...fixedHeaders,
    ...participationHeaders,
    ...demographyHeaders,
    ...dynamicDistrictHeaders,
    ...insuranceHeaders,
  ]

  const headerMap = [
    { title: 'DATOS DE ACTIVIDAD', cols: fixedHeaders.length },
    { title: 'PARTICIPACIÓN', cols: participationHeaders.length },
    { title: 'TOTAL REGISTRADOS', cols: 1 },
    { title: 'SEXO', cols: 2 },
    { title: 'RANGO DE EDAD', cols: 3 },
    {
      title: 'DISTRITOS DE PARTICIPANTES',
      cols: dynamicDistrictHeaders.length,
    },
    { title: 'SEGURO DE SALUD', cols: insuranceHeaders.length },
  ]

  let currentColumn = 1
  const headerRow1 = worksheet.addRow([])

  headerMap.forEach((item) => {
    headerRow1.getCell(currentColumn).value = item.title
    if (item.cols > 1) {
      const startCol = currentColumn
      const endCol = currentColumn + item.cols - 1
      worksheet.mergeCells(
        headerRow1.number,
        startCol,
        headerRow1.number,
        endCol,
      )
    }
    currentColumn += item.cols
  })

  headerRow1.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF089C54' },
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF089C54' } },
      left: { style: 'thin', color: { argb: 'FF089C54' } },
      bottom: { style: 'thin', color: { argb: 'FF089C54' } },
      right: { style: 'thin', color: { argb: 'FF089C54' } },
    }
  })

  const headerRow2 = worksheet.addRow(columnNamesRow2)

  headerRow2.eachCell((cell) => {
    cell.font = { bold: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0FFF0' },
    } // Verde claro
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF089C54' } },
      left: { style: 'thin', color: { argb: 'FF089C54' } },
      bottom: { style: 'thin', color: { argb: 'FF089C54' } },
      right: { style: 'thin', color: { argb: 'FF089C54' } },
    }
  })

  const presetWidths: number[] = [
    5, // 1: N°
    35, // 2: ACTIVIDAD
    18, // 3: DISTRITO
    25, // 4: ESAC INVOLUCRADAS
    28, // 5: LUGAR (Dirección)
    14, // 6: FECHA (Ajustado para DD/MM/YYYY)
    22, // 7: DURACIÓN DE IES
    25, // 8: ALIADOS
    30, // 9: ESPECIALIDADES
    20, // 10: TOTAL REGISTRADOS
    10, // 11: F
    10, // 12: M
    18, // 13: MENORES DE 18
    15, // 14: 18 A 64
    15, // 15: 65 A MÁS
    // Las siguientes 3 columnas son para los Seguros
    15, // PÚBLICO
    15, // PRIVADO
    15, // NINGUNO
  ]

  const columnDefinitions = []

  for (let i = 0; i < 15; i++) {
    columnDefinitions.push({ width: presetWidths[i] })
  }

  const districtWidth = 35
  for (let i = 0; i < dynamicDistrictHeaders.length; i++) {
    columnDefinitions.push({ width: districtWidth })
  }

  for (let i = 15; i < 18; i++) {
    columnDefinitions.push({ width: presetWidths[i] })
  }

  worksheet.columns = columnDefinitions

  let startRowMerge = worksheet.lastRow.number + 1

  for (const activity of mergedData) {
    const { demographics } = activity
    const participations =
      activity.participations && activity.participations.length > 0
        ? activity.participations
        : [{ alliedName: 'N/A', specialityName: 'N/A' }]

    const groupedParticipations = participations.reduce(
      (acc, p) => {
        if (!acc[p.alliedName]) {
          acc[p.alliedName] = []
        }
        acc[p.alliedName].push(p)
        return acc
      },
      {} as { [key: string]: any[] },
    )

    const sortedParticipations: any[] = Object.values(
      groupedParticipations,
    ).flat()

    const numParticipationRows = sortedParticipations.length
    const endRowMerge = startRowMerge + numParticipationRows - 1

    const districtCountsRow = dynamicDistrictHeaders.map(
      (header) => demographics.districtCounts[header] || 0,
    )

    const fixedData = [
      activity.id,
      activity.name,
      activity.regionName,
      activity.spaceName,
      activity.address,
      formatDate(activity.date),
      activity.duration,
    ]

    const demographyData = [
      demographics.totalAsistentes,
      demographics.countF,
      demographics.countM,
      demographics.countMenores18,
      demographics.count18a64,
      demographics.count65Mas,
      ...districtCountsRow,
      demographics.countPublico,
      demographics.countPrivado,
      demographics.countOtrosSeguros,
    ]

    for (let i = 0; i < numParticipationRows; i++) {
      const p = sortedParticipations[i]

      const rowData = [
        ...fixedData,
        p.alliedName,
        p.specialityName,
        ...demographyData,
      ]

      const newRow = worksheet.addRow(rowData)

      newRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF089C54' } },
          left: { style: 'thin', color: { argb: 'FF089C54' } },
          bottom: { style: 'thin', color: { argb: 'FF089C54' } },
          right: { style: 'thin', color: { argb: 'FF089C54' } },
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })
    }

    if (numParticipationRows > 1) {
      const fixedAndDemoColsToMerge: number[] = []
      for (let i = 1; i <= fixedHeaders.length; i++) {
        fixedAndDemoColsToMerge.push(i)
      }
      for (let i = DEMO_START_COL_INDEX; i <= columnNamesRow2.length; i++) {
        fixedAndDemoColsToMerge.push(i)
      }

      fixedAndDemoColsToMerge.forEach((colIndex) => {
        worksheet.mergeCells(startRowMerge, colIndex, endRowMerge, colIndex)
      })

      let currentAllyStartRow = startRowMerge
      let currentAllyName = sortedParticipations[0].alliedName

      for (let i = 1; i < numParticipationRows; i++) {
        const nextAllyName = sortedParticipations[i].alliedName
        const currentRow = startRowMerge + i

        if (nextAllyName !== currentAllyName) {
          const allyBlockSize = currentRow - currentAllyStartRow

          if (allyBlockSize > 1) {
            worksheet.mergeCells(
              currentAllyStartRow,
              ALIED_COL_INDEX, // Columna H
              currentRow - 1,
              ALIED_COL_INDEX,
            )
          }

          currentAllyName = nextAllyName
          currentAllyStartRow = currentRow
        }
      }

      const lastAllyBlockSize = endRowMerge - currentAllyStartRow + 1
      if (lastAllyBlockSize > 1) {
        worksheet.mergeCells(
          currentAllyStartRow,
          ALIED_COL_INDEX, // Columna H
          endRowMerge,
          ALIED_COL_INDEX,
        )
      }
    }

    startRowMerge = endRowMerge + 1
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer as unknown as Buffer
}

export const exportActivitiesToCsv = async ({
  query,
  set,
}: {
  query: ActivityModel.ExportQuery
  set: any
}) => {
  try {
    const {
      activityIds,
      filterOnly,
      q = '',
      regionIds,
      startDate,
      endDate,
    } = query

    const baseConditions: any[] = [eq(activity.state, true)]
    let idsToFetch: number[] = []
    const searchQuery = q.replaceAll(/\s+/g, ' ').trim()

    if (activityIds) {
      idsToFetch = activityIds
        .split(',')
        .map((id: string) => Number.parseInt(id.trim(), 10))
        .filter((id: unknown) => !Number.isNaN(id))
    } else if (filterOnly === 'true') {
      if (searchQuery) {
        baseConditions.push(
          or(
            ilike(activity.name, `%${searchQuery}%`),
            ilike(activityStatus.name, `%${searchQuery}%`),
            ilike(activityType.name, `%${searchQuery}%`),
            ilike(region.name, `%${searchQuery}%`),
            ilike(user.name, `%${searchQuery}%`),
          ),
        )
      }

      const regionIdsArray = regionIds
        ? regionIds.split(',').map((id) => Number.parseInt(id, 10))
        : []

      if (regionIdsArray.length > 0) {
        baseConditions.push(
          or(
            ...regionIdsArray.map((id: number | SQLWrapper) =>
              eq(activity.regionId, id),
            ),
          ),
        )
      }

      if (startDate) {
        baseConditions.push(gte(activity.date, startDate))
      }
      if (endDate) {
        baseConditions.push(lte(activity.date, endDate))
      }

      const filteredActivities = await db
        .select({ id: activity.id })
        .from(activity)
        .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
        .innerJoin(activityType, eq(activity.typeId, activityType.id))
        .innerJoin(region, eq(activity.regionId, region.id))
        .innerJoin(user, eq(activity.userId, user.id))
        .where(and(...baseConditions))
        .orderBy(asc(activity.date))

      idsToFetch = filteredActivities.map((a) => a.id)
    } else {
      set.status = 400
      return 'No se especificó ninguna actividad o filtro para exportar.'
    }

    if (idsToFetch.length === 0) {
      set.status = 400
      return 'No se encontraron actividades para exportar con los criterios dados.'
    }

    const [detailedActivities, demographicsMap, dynamicDistrictHeaders] =
      await Promise.all([
        getDetailedActivitiesByIds(idsToFetch), // Obtiene la actividad, aliados, especialidades
        getActivityDemographics(idsToFetch), // Obtiene conteos de Sexo, Edad, Seguros y Distritos
        getParticipantDistricts(idsToFetch), // Obtiene los nombres de las columnas de distrito
      ])

    const mergedData = detailedActivities.map((activity: { id: any }) => ({
      ...activity,
      demographics: demographicsMap.get(activity.id) || {
        totalAsistentes: 0,
        countF: 0,
        countM: 0,
        countMenores18: 0,
        count18a64: 0,
        count65Mas: 0,
        countPublico: 0,
        countPrivado: 0,
        countOtrosSeguros: 0,
        districtCounts: {},
      },
    }))

    const csvContent = toDetailedCsv(mergedData, dynamicDistrictHeaders)

    set.headers = {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="detalle_actividades_${new Date().toISOString().slice(0, 10)}.csv"`,
    }

    return csvContent
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const exportActivitiesToXlsx = async ({
  query,
  set,
}: {
  query: ActivityModel.ExportQuery
  set: any
}) => {
  try {
    const {
      activityIds,
      filterOnly,
      q = '',
      regionIds,
      startDate,
      endDate,
    } = query

    const baseConditions: any[] = [eq(activity.state, true)]
    let idsToFetch: number[] = []
    const searchQuery = q.replaceAll(/\s+/g, ' ').trim()

    if (activityIds) {
      idsToFetch = activityIds
        .split(',')
        .map((id: string) => Number.parseInt(id.trim(), 10))
        .filter((id: unknown) => !Number.isNaN(id))
    } else if (filterOnly === 'true') {
      if (searchQuery) {
        baseConditions.push(
          or(
            ilike(activity.name, `%${searchQuery}%`),
            ilike(activityStatus.name, `%${searchQuery}%`),
            ilike(activityType.name, `%${searchQuery}%`),
            ilike(region.name, `%${searchQuery}%`),
            ilike(user.name, `%${searchQuery}%`),
          ),
        )
      }

      const regionIdsArray = regionIds
        ? regionIds.split(',').map((id) => Number.parseInt(id, 10))
        : []

      if (regionIdsArray.length > 0) {
        baseConditions.push(
          or(
            ...regionIdsArray.map((id: number | SQLWrapper) =>
              eq(activity.regionId, id),
            ),
          ),
        )
      }

      if (startDate) {
        baseConditions.push(gte(activity.date, startDate))
      }
      if (endDate) {
        baseConditions.push(lte(activity.date, endDate))
      }

      const filteredActivities = await db
        .select({ id: activity.id })
        .from(activity)
        .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
        .innerJoin(activityType, eq(activity.typeId, activityType.id))
        .innerJoin(region, eq(activity.regionId, region.id))
        .innerJoin(user, eq(activity.userId, user.id))
        .where(and(...baseConditions))
        .orderBy(asc(activity.date))

      idsToFetch = filteredActivities.map((a) => a.id)
    } else {
      set.status = 400
      return 'No se especificó ninguna actividad o filtro para exportar.'
    }

    if (idsToFetch.length === 0) {
      set.status = 400
      return 'No se encontraron actividades para exportar con los criterios dados.'
    }

    const [detailedActivities, demographicsMap, dynamicDistrictHeaders] =
      await Promise.all([
        getDetailedActivitiesByIds(idsToFetch), // Obtiene la actividad, aliados, especialidades
        getActivityDemographics(idsToFetch), // Obtiene conteos de Sexo, Edad, Seguros y Distritos
        getParticipantDistricts(idsToFetch), // Obtiene los nombres de las columnas de distrito
      ])

    const mergedData = detailedActivities.map((activity: { id: any }) => ({
      ...activity,
      demographics: demographicsMap.get(activity.id) || {
        totalAsistentes: 0,
        countF: 0,
        countM: 0,
        countMenores18: 0,
        count18a64: 0,
        count65Mas: 0,
        countPublico: 0,
        countPrivado: 0,
        countOtrosSeguros: 0,
        districtCounts: {},
      },
    }))

    const xlsxBuffer = await toDetailedXlsx(mergedData, dynamicDistrictHeaders)

    const base64String = xlsxBuffer.toString('base64')

    return base64String
  } catch (e) {
  if (e instanceof Error) throw new PostgresError(e.message)
  throw e
  }
}

export const checkActivitiesHaveActiveAttendees = async (ids: number[]) => {
  try {
    const activitiesWithAttendees = await db
      .select({
        activityId: activity.id,
        activityName: activity.name,
        attendeesCount: count(activityUser.userId),
      })
      .from(activityUser)
      .innerJoin(activity, eq(activityUser.activityId, activity.id))
      .innerJoin(user, eq(user.id, activityUser.userId))
      .where(and(inArray(activity.id, ids), eq(user.active, true)))
      .groupBy(activity.id, activity.name)
    return activitiesWithAttendees
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const checkActivitiesStatus = async (ids: number[]) => {
  try {
    const activities = await db
      .select({
        activityId: activity.id,
        activityName: activity.name,
        activityStatus: activityStatus.name,
      })
      .from(activity)
      .innerJoin(activityStatus, eq(activityStatus.id, activity.statusId))
      .where(
        and(
          inArray(activity.id, ids),
          not(eq(activityStatus.name, 'Programado')),
        ),
      )
    return activities
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
