import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { region } from '@api/db/schemas/auth'
import { fairs } from '@api/db/schemas/education'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { FairModel } from './model'

export async function getFairs(
  params: FairModel.ListFairsQuery,
): Promise<FairModel.GetFairsResponse> {
  const {
    q = '',
    district,
    date,
    page = 0,
    limit = 10,
    sortBy = 'date.desc',
  } = params

  const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'date.desc').split('.', 2)
  const sortField = (sortFieldRaw ?? 'date').trim()
  const sortOrder =
    (sortOrderRaw ?? 'desc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

  const columns = {
    title: fairs.title,
    date: fairs.date,
    district: region.name,
  } as const

  const column = columns[sortField as keyof typeof columns] ?? fairs.date
  const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

  const searchCondition = q ? or(ilike(fairs.title, `%${q}%`)) : undefined

  const districtCondition = district
    ? eq(fairs.regionId, Number(district))
    : undefined

  const dateCondition = date ? eq(fairs.date, date) : undefined

  const activeCondition = eq(fairs.active, true)

  const where = and(
    activeCondition,
    searchCondition,
    districtCondition,
    dateCondition,
  )

  try {
    const [{ total }] = await db
      .select({ total: count() })
      .from(fairs)
      .innerJoin(region, eq(fairs.regionId, region.id))
      .where(where)

    const rows = await db
      .select({
        id: fairs.id,
        title: fairs.title,
        address: fairs.address,
        district: region.name,
        active: fairs.active,
        startTime: fairs.startTime,
        endTime: fairs.endTime,
        date: fairs.date,
      })
      .from(fairs)
      .innerJoin(region, eq(fairs.regionId, region.id))
      .where(where)
      .offset(page * limit)
      .limit(limit)
      .orderBy(orderExpr)

    const totalPages = Math.ceil(total / limit)

    return {
      data: rows.map((row) => ({
        ...row,
        date: row.date?.toString() ?? '',
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
    const response = await db.query.fairs.findFirst({
      where: (fairs, { eq }) => eq(fairs.id, id),
    })

    if (!response) return null

    return {
      ...response,
      date: response.date?.toString(),
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const createFair = async (args: FairModel.CreateFair) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx.insert(fairs).values(args).returning({
        id: fairs.id,
      })
    })
    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const patchFair = async (id: number, args: FairModel.UpdateFair) => {
  try {
    const response = await db
      .update(fairs)
      .set({
        ...args,
      })
      .where(eq(fairs.id, id))
      .returning({ id: fairs.id })
    return response.length
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
