import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { region } from '@api/db/schemas/auth'
import { fair } from '@api/db/schemas/education'
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
    title: fair.title,
    date: fair.date,
    district: region.name,
  } as const

  const column = columns[sortField as keyof typeof columns] ?? fair.date
  const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

  const searchCondition = q ? or(ilike(fair.title, `%${q}%`)) : undefined

  const districtCondition = district
    ? eq(fair.regionId, Number(district))
    : undefined

  const dateCondition = date ? eq(fair.date, date) : undefined

  const activeCondition = eq(fair.active, true)

  const where = and(
    activeCondition,
    searchCondition,
    districtCondition,
    dateCondition,
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
    const response = await db.query.fair.findFirst({
      where: (fairs, { eq }) => eq(fairs.id, id),
    })

    if (!response) return null

    return {
      ...response,
      date: new Date(response.date),
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const createFair = async (args: FairModel.CreateFair) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx.insert(fair).values(args).returning({
        id: fair.id,
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
      .update(fair)
      .set({
        ...args,
      })
      .where(eq(fair.id, id))
      .returning({ id: fair.id })
    return response.length
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
