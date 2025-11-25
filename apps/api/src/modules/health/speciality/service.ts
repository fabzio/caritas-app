import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import {
  activity,
  alliedParticipation,
  speciality,
} from '@api/db/schemas/health'
import { normalizeText } from '@api/utils/normalize-text'
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm'
import type { SpecialityModel } from './model'

export async function getSpecialities(
  params: SpecialityModel.GetSpecialitiesQuery,
): Promise<SpecialityModel.GetSpecialitiesResponse> {
  const { q = '', page = 0, limit = 10, sortBy = 'name.asc' } = params

  const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
  const sortField = (sortFieldRaw ?? 'name').trim()
  const sortOrder =
    (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

  const columns = {
    name: speciality.name,
  } as const

  const column = columns[sortField as keyof typeof columns] ?? speciality.name
  const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

  const allRows = await db
    .select({ speciality })
    .from(speciality)
    .where(eq(speciality.active, true))
    .orderBy(orderExpr)

  const normalizedQ = normalizeText(q)
  const filteredRows = normalizedQ
    ? allRows.filter(({ speciality: s }) =>
        normalizeText(s.name).includes(normalizedQ),
      )
    : allRows

  const total = filteredRows.length
  const start = page * limit
  const paginated = filteredRows.slice(start, start + limit)
  const totalPages = Math.ceil(total / limit)

  return {
    data: paginated.map((r) => r.speciality),
    total,
    page,
    limit,
    totalPages,
  }
}

export async function getSingleSpeciality(id: number) {
  const data = await db.query.speciality.findFirst({
    where: (speciality, { and, eq }) =>
      and(eq(speciality.id, id), eq(speciality.active, true)),
  })
  return data ?? null
}

export const createSpeciality = async (
  args: SpecialityModel.CreateSpeciality,
) => {
  const similarInactive = await findSimilarInactiveSpeciality(args.name)

  if (similarInactive) {
    await activateSpeciality(similarInactive.id)
    return similarInactive.id
  }

  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx.insert(speciality).values(args).returning({
        id: speciality.id,
      })
    })
    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const updateSpeciality = async (
  id: number,
  args: SpecialityModel.UpdateSpeciality,
) => {
  try {
    const result = await db
      .update(speciality)
      .set({ name: args.name })
      .where(eq(speciality.id, id))
      .returning()
    return result[0] ?? null
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export async function findDuplicateSpeciality(
  name: string,
  excludeId?: number,
) {
  const response = await db
    .select({ speciality })
    .from(speciality)
    .where(eq(speciality.active, true))

  const allRows = response.map((s) => s.speciality)

  if (!allRows?.length) return null

  const coincidences = allRows.filter(
    (s) => normalizeText(s.name) === normalizeText(name),
  )

  if (!coincidences.length) return null

  const excluded = coincidences.find((s) => s.id !== excludeId)

  return excluded || null
}

async function findSimilarInactiveSpeciality(name: string) {
  const normalizedName = normalizeText(name)

  const allInactive = await db
    .select({ speciality })
    .from(speciality)
    .where(eq(speciality.active, false))

  return (
    allInactive
      .map((r) => r.speciality)
      .find((s) => normalizeText(s.name) === normalizedName) ?? null
  )
}

const activateSpeciality = async (id: number) => {
  try {
    const result = await db
      .update(speciality)
      .set({ active: true })
      .where(eq(speciality.id, id))
      .returning()
    return result[0] ?? null
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const deleteSpecialities = async (ids: number[]) => {
  try {
    await db
      .update(speciality)
      .set({ active: false })
      .where(inArray(speciality.id, ids))
    return { success: true }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export async function hasActivitiesAssociated(id: number) {
  const activityCount = await db
    .select({ count: count() })
    .from(alliedParticipation)
    .where(eq(alliedParticipation.specialityId, id))
  return activityCount[0].count > 0
}

export const checkSpecialityHaveActiveActivities = async (ids: number[]) => {
  try {
    const withActivities = await db
      .select({
        specialityId: alliedParticipation.specialityId,
        specialityName: speciality.name,
        activityCount: count(activity.id),
      })
      .from(alliedParticipation)
      .innerJoin(activity, eq(alliedParticipation.activityId, activity.id))
      .innerJoin(
        speciality,
        eq(speciality.id, alliedParticipation.specialityId),
      )
      .where(
        and(
          inArray(alliedParticipation.specialityId, ids),
          eq(activity.state, true),
        ),
      )
      .groupBy(alliedParticipation.specialityId, speciality.name)
    console.log('check:', withActivities)
    return withActivities
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
