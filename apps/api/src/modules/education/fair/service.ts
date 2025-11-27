import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization, region } from '@api/db/schemas/auth'
import { fair, fairOrganization } from '@api/db/schemas/education'
import { normalizeText } from '@api/utils/normalize-text'
import { and, asc, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import type { FairModel } from './model'
export const findDuplicateFair = async (
  title?: string,
  regionId?: number,
  date?: Date,
  startTime?: string,
  endTime?: string,
  excludeId?: number,
) => {
  if (!title || !regionId || !date || !startTime || !endTime) return null

  const existingFairs = await db
    .select({ fair })
    .from(fair)
    .where(
      and(
        eq(fair.active, true),
        eq(fair.regionId, regionId),
        eq(fair.date, date.toISOString().slice(0, 10)),
      ),
    )

  if (!existingFairs?.length) return null

  const normalizedTitle = normalizeText(title)

  const duplicates = existingFairs
    .map((r) => r.fair)
    .filter((f) => {
      const sameTitle = normalizeText(f.title) === normalizedTitle
      const sameDay =
        f.date instanceof Date && date instanceof Date
          ? f.date.toISOString().slice(0, 10) ===
            date.toISOString().slice(0, 10)
          : false

      const overlapsTime =
        typeof f.startTime === 'string' &&
        typeof f.endTime === 'string' &&
        f.startTime <= endTime &&
        f.endTime >= startTime

      return sameTitle && sameDay && overlapsTime && f.id !== excludeId
    })

  return duplicates.length > 0 ? duplicates[0] : null
}

type FairStatus = 'upcoming' | 'ongoing' | 'finished'

function calculateFairStatus(
  fairDate: Date,
  startTime: string,
  endTime: string,
): FairStatus {
  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 8)
  const currentDate = now.toISOString().split('T')[0]
  const fairDateStr = fairDate.toISOString().split('T')[0]

  if (fairDateStr > currentDate) return 'upcoming'
  if (fairDateStr < currentDate) return 'finished'
  if (currentTime < startTime) return 'upcoming'
  if (currentTime > endTime) return 'finished'
  return 'ongoing'
}

export async function getFairs(
  params: FairModel.ListFairsQuery,
): Promise<FairModel.GetFairsResponse> {
  const {
    q = '',
    district,
    date,
    status: statusFilter,
    page = 0,
    limit = 10,
    sortBy = 'date.desc',
  } = params

  const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'date.desc').split('.', 2)
  const sortField = (sortFieldRaw ?? 'date').trim()
  const sortOrder =
    (sortOrderRaw ?? 'desc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

  const columns = {
    title: fair.title,
    date: fair.date,
    district: region.name,
  } as const

  const column = columns[sortField as keyof typeof columns] ?? fair.date
  const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

  const searchCondition = q ? or(ilike(fair.title, `%${q}%`)) : undefined

  const districtCondition = district
    ? inArray(
        region.name,
        district.split(',').map((d) => d.trim()),
      )
    : undefined

  const dateCondition = date ? eq(fair.date, date) : undefined

  const statusFilters = statusFilter?.split(',').map((s) => s.trim()) ?? []
  let statusCondition: ReturnType<typeof sql> | undefined

  if (statusFilters.length > 0) {
    const conditions = statusFilters.map((status) => {
      if (status === 'upcoming') {
        return sql`(${fair.date} > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date OR (${fair.date} = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date AND ${fair.startTime} > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time))`
      }
      if (status === 'ongoing') {
        return sql`(${fair.date} = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date AND ${fair.startTime} <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time AND ${fair.endTime} > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time)`
      }
      if (status === 'finished') {
        return sql`(${fair.date} < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date OR (${fair.date} = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date AND ${fair.endTime} <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time))`
      }
      return sql`FALSE`
    })

    statusCondition = conditions.length > 0 ? or(...conditions) : undefined
  }

  const activeCondition = eq(fair.active, true)

  const where = and(
    activeCondition,
    searchCondition,
    districtCondition,
    dateCondition,
    statusCondition,
  )

  try {
    const [{ total }] = await db
      .select({ total: count() })
      .from(fair)
      .innerJoin(region, eq(fair.regionId, region.id))
      .where(where)

    const rows = await db
      .select({
        id: fair.id,
        title: fair.title,
        address: fair.address,
        district: region.name,
        active: fair.active,
        startTime: fair.startTime,
        endTime: fair.endTime,
        date: fair.date,
        assistanceCount: fair.assistanceCount,
        fourthGradeAssistance: fair.fourthGradeAssistance,
        fifthGradeAssistance: fair.fifthGradeAssistance,
      })
      .from(fair)
      .innerJoin(region, eq(fair.regionId, region.id))
      .where(where)
      .offset(page * limit)
      .limit(limit)
      .orderBy(orderExpr)

    const totalPages = Math.ceil(total / limit)

    return {
      data: rows.map((row) => ({
        ...row,
        date: new Date(row.date),
        status: calculateFairStatus(
          new Date(row.date),
          row.startTime,
          row.endTime,
        ),
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
export const getSingleFair = async ({ id }: { id: number }) => {
  try {
    const fairData = await db.query.fair.findFirst({
      where: (fairs, { eq }) => eq(fairs.id, id),
    })

    if (!fairData) return null

    const organizations = await db
      .select({
        id: organization.id,
        name: organization.name,
      })
      .from(fairOrganization)
      .innerJoin(
        organization,
        eq(fairOrganization.organizationId, organization.id),
      )
      .where(eq(fairOrganization.fairId, id))

    return {
      ...fairData,
      date: new Date(fairData.date),
      organizations,
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const createFair = async (args: FairModel.CreateFair) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      const [{ id }] = await tx
        .insert(fair)
        .values(args)
        .returning({ id: fair.id })

      if (args.organizations && args.organizations.length > 0) {
        await tx.insert(fairOrganization).values(
          args.organizations.map((o) => ({
            fairId: id,
            organizationId: o.organizationId,
          })),
        )
      }
      return [{ id }]
    })

    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const patchFair = async (id: number, args: FairModel.UpdateFair) => {
  try {
    await db.transaction(async (tx) => {
      await tx.update(fair).set(args).where(eq(fair.id, id))

      if (args.organizations) {
        await tx.delete(fairOrganization).where(eq(fairOrganization.fairId, id))
        if (args.organizations.length > 0) {
          await tx.insert(fairOrganization).values(
            args.organizations.map((o) => ({
              fairId: id,
              organizationId: o.organizationId,
            })),
          )
        }
      }
    })
    return 1
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const deleteFairs = async (ids: number[]) => {
  try {
    await db.update(fair).set({ active: false }).where(inArray(fair.id, ids))
    return { success: true }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const getFairRegions = async () => {
  try {
    const regions = await db
      .selectDistinct({
        id: region.id,
        name: region.name,
      })
      .from(fair)
      .innerJoin(region, eq(fair.regionId, region.id))
      .where(eq(fair.active, true))
      .orderBy(asc(region.name))

    return regions
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const getFairStatus = async () => {
  try {
    const activeFairs = await db
      .select({
        date: fair.date,
        startTime: fair.startTime,
        endTime: fair.endTime,
      })
      .from(fair)
      .where(eq(fair.active, true))

    const statusesSet = new Set<FairStatus>()

    for (const fairData of activeFairs) {
      const status = calculateFairStatus(
        new Date(fairData.date),
        fairData.startTime,
        fairData.endTime,
      )
      statusesSet.add(status)
    }

    const allStatuses = [
      { value: 'upcoming', label: 'Próxima' },
      { value: 'ongoing', label: 'En curso' },
      { value: 'finished', label: 'Finalizada' },
    ]

    return allStatuses.filter((status) =>
      statusesSet.has(status.value as FairStatus),
    )
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const getFairsAttendance = async (
  params: FairModel.ListFairsQuery,
): Promise<FairModel.GetAttendanceResponse> => {
  const {
    q = '',
    district,
    date,
    status: statusFilter,
    page = 0,
    limit = 10,
    sortBy = 'date.desc',
  } = params

  const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'date.desc').split('.', 2)
  const sortField = (sortFieldRaw ?? 'date').trim()
  const sortOrder =
    (sortOrderRaw ?? 'desc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

  const columns = {
    title: fair.title,
    date: fair.date,
    district: region.name,
  } as const

  const column = columns[sortField as keyof typeof columns] ?? fair.date
  const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

  const searchCondition = q ? or(ilike(fair.title, `%${q}%`)) : undefined

  const districtCondition = district
    ? inArray(
        region.name,
        district.split(',').map((d) => d.trim()),
      )
    : undefined

  const dateCondition = date ? eq(fair.date, date) : undefined

  const statusFilters = statusFilter?.split(',').map((s) => s.trim()) ?? []
  let statusCondition: ReturnType<typeof sql> | undefined

  if (statusFilters.length > 0) {
    const conditions = statusFilters.map((status) => {
      if (status === 'upcoming') {
        return sql`(${fair.date} > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date OR (${fair.date} = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date AND ${fair.startTime} > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time))`
      }
      if (status === 'ongoing') {
        return sql`(${fair.date} = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date AND ${fair.startTime} <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time AND ${fair.endTime} > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time)`
      }
      if (status === 'finished') {
        return sql`(${fair.date} < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date OR (${fair.date} = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date AND ${fair.endTime} <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time))`
      }
      return sql`FALSE`
    })

    statusCondition = conditions.length > 0 ? or(...conditions) : undefined
  }

  const activeCondition = eq(fair.active, true)

  const where = and(
    activeCondition,
    searchCondition,
    districtCondition,
    dateCondition,
    statusCondition,
  )

  try {
    const [{ total }] = await db
      .select({ total: count() })
      .from(fair)
      .innerJoin(region, eq(fair.regionId, region.id))
      .where(where)

    const rows = await db
      .select({
        id: fair.id,
        title: fair.title,
        date: fair.date,
        district: region.name,
        assistanceCount: fair.assistanceCount,
        fourthGradeAssistance: fair.fourthGradeAssistance,
        fifthGradeAssistance: fair.fifthGradeAssistance,
        startTime: fair.startTime,
        endTime: fair.endTime,
      })
      .from(fair)
      .innerJoin(region, eq(fair.regionId, region.id))
      .where(where)
      .offset(page * limit)
      .limit(limit)
      .orderBy(orderExpr)

    const totalPages = Math.ceil(total / limit)

    return {
      data: rows.map((row) => ({
        id: row.id,
        title: row.title,
        date: new Date(row.date),
        district: row.district,
        assistanceCount: row.assistanceCount,
        fourthGradeAssistance: row.fourthGradeAssistance,
        fifthGradeAssistance: row.fifthGradeAssistance,
        status: calculateFairStatus(
          new Date(row.date),
          row.startTime,
          row.endTime,
        ),
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

export const updateFairAttendance = async (
  id: number,
  attendance: FairModel.UpdateAttendance,
) => {
  try {
    await db
      .update(fair)
      .set({
        assistanceCount: attendance.assistanceCount,
        fourthGradeAssistance: attendance.fourthGradeAssistance,
        fifthGradeAssistance: attendance.fifthGradeAssistance,
      })
      .where(eq(fair.id, id))

    return 1
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const checkFairsOngoingOrEnded = async (ids: number[]) => {
  try {
    const fairsEnded = await db
      .select({
        fairId: fair.id,
        fairName: fair.title,
        fairCount: count(fair.id),
      })
      .from(fair)
      .where(
        and(
          sql`(${fair.date} < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date OR (${fair.date} = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date AND ${fair.endTime} <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::time))`,
          inArray(fair.id, ids),
        ),
      )
      .groupBy(fair.id, fair.title)
    return fairsEnded
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
