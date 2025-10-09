import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization, user } from '@api/db/schemas/auth' // Tablas de autenticación
import { activity, activityStatus, activityType } from '@api/db/schemas/health'
import { asc, count, desc, eq, ilike, or } from 'drizzle-orm'
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

    // 2. Cláusula WHERE (Filtro de Búsqueda)
    const where = searchQuery
      ? or(
          ilike(activity.name, `%${searchQuery}%`), // Por nombre de actividad
          ilike(activityStatus.name, `%${searchQuery}%`), // Por estado
          ilike(activityType.name, `%${searchQuery}%`), // Por tipo
          ilike(organization.name, `%${searchQuery}%`), // Por espacio
          ilike(user.name, `%${searchQuery}%`), // Por creador/responsable
        )
      : undefined

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

    return { data: rows, total, page, limit, totalPages }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
