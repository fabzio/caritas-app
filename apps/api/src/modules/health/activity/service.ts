import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization, user } from '@api/db/schemas/auth' // Tablas de autenticación
import {
  activity,
  activityStatus,
  activityType,
  alliedParticipation,
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

export async function getActivities(
  params: ActivityModel.ListActivitiesQuery,
): Promise<ActivityModel.GetActivities> {
  try {
    const { q = '', page = 0, limit = 10, sortBy = 'name.asc' } = params
    const searchQuery = q.replace(/\s+/g, ' ').trim()

    // 1. Procesamiento de Ordenamiento
    const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
    const sortField = (sortFieldRaw ?? 'name').trim()
    const sortOrder =
      (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

    // Mapeo de columnas para ordenar
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

    // 2. Cláusula WHERE (Filtro de Búsqueda + Solo actividades activas)
    const searchConditions = searchQuery
      ? or(
          ilike(activity.name, `%${searchQuery}%`), // Por nombre de actividad
          ilike(activityStatus.name, `%${searchQuery}%`), // Por estado
          ilike(activityType.name, `%${searchQuery}%`), // Por tipo
          ilike(organization.name, `%${searchQuery}%`), // Por espacio
          ilike(user.name, `%${searchQuery}%`), // Por creador/responsable
        )
      : undefined

    // Combinar filtro de búsqueda con filtro de state = true
    const where = searchConditions
      ? and(eq(activity.state, true), searchConditions)
      : eq(activity.state, true)

    // 3. Conteo Total (para paginación)
    // **INICIA la consulta de conteo y aplica los JOINs aquí**
    const [{ total }] = await db
      .select({ total: count(activity.id) })
      .from(activity)
      .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
      .innerJoin(activityType, eq(activity.typeId, activityType.id))
      .innerJoin(organization, eq(activity.spaceId, organization.id))
      .innerJoin(user, eq(activity.userId, user.id))
      .where(where)

    const totalPages = Math.ceil(total / limit)

    // 4. Consulta Principal (Obtener las filas de la página)
    // **INICIA la consulta SELECT y aplica los JOINs aquí**
    const rows = await db
      .select({
        // Campos de la tabla (activity.*)
        id: activity.id,
        name: activity.name,
        date: activity.date,
        duration: activity.duration,
        state: activity.state,

        // Campos JOINED (nombres legibles)
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

    // Validar que los IDs existan y estén activos
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

    // Realizar eliminación lógica (state = false)
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

    // Validar que todos los aliados y especialidades existan
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

    // Crear actividad y participantes en una transacción
    const result = await db.transaction(async (tx) => {
      // 1. Crear la actividad
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

      // 2. Crear las participaciones (allied_participation)
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
    console.log('[getActivityById] Buscando actividad id:', id)

    const allActivities = await db
      .select({ id: activity.id, name: activity.name, state: activity.state })
      .from(activity)
      .where(eq(activity.id, id))

    console.log(
      '[getActivityById] Todas las actividades con ese id:',
      allActivities,
    )

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

    console.log('[getActivityById] Actividad encontrada:', activityData)

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

    console.log(
      '[getActivityById] Participaciones encontradas:',
      participations,
    )

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
      date:
        activityData.date instanceof Date
          ? activityData.date.toISOString().split('T')[0]
          : activityData.date,
      participants: Array.from(participantsMap.values()),
    }

    console.log(
      '[getActivityById] Resultado final:',
      JSON.stringify(result, null, 2),
    )

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
