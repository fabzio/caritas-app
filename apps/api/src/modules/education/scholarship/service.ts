import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { scholarship, scholarshipApplication } from '@api/db/schemas/education'
import { normalizeText } from '@api/utils/normalize-text'
import { eq, ilike, sql } from 'drizzle-orm'
import type { ScholarshipModel } from './model'

type GetParams = {
  name?: string
  active?: boolean
  page?: number
  pageSize?: number
}
export const findDuplicateScholarship = async (
  name: string,
  excludeId?: number,
) => {
  const response = await db
    .select({ scholarship })
    .from(scholarship)
    .where(eq(scholarship.active, true))

  const allRows = response.map((s) => s.scholarship)

  if (!allRows?.length) return null

  const coincidences = allRows.filter(
    (s) => normalizeText(s.name) === normalizeText(name),
  )

  if (!coincidences.length) return null

  const excluded = coincidences.find((s) => s.id !== excludeId)

  return excluded || null
}
export const createScholarship = async (
  args: ScholarshipModel.CreateScholarship,
) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx.insert(scholarship).values(args).returning({
        id: scholarship.id,
      })
    })
    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const getScholarships = async ({
  name,
  active,
  page = 1,
  pageSize = 10,
}: GetParams): Promise<ScholarshipModel.Paginated> => {
  try {
    const conditions = []
    if (name) conditions.push(ilike(scholarship.name, `%${name}%`))
    if (active !== undefined) conditions.push(eq(scholarship.active, active))

    const where =
      conditions.length > 0
        ? sql`${sql.join(conditions, sql` AND `)}`
        : undefined
    const offset = (page - 1) * pageSize

    let total = 0
    if (where) {
      const [r] = await db
        .select({ total: sql<number>`count(*)` })
        .from(scholarship)
        .where(where)
      total = Number(r.total)
    } else {
      const [r] = await db
        .select({ total: sql<number>`count(*)` })
        .from(scholarship)
      total = Number(r.total)
    }
    const rows = await db.query.scholarship.findMany({
      where,
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: {
        organization: {
          columns: { id: true, name: true },
        },
      },
      limit: pageSize,
      offset,
    })
    const data = rows.map((r) => ({
      ...r,
      startDate: r.startDate.toString(),
      endDate: r.endDate.toString(),
    }))
    const pageCount = Math.ceil(total / pageSize)
    return {
      data,
      page,
      pageSize,
      total,
      pageCount,
      hasNext: page < pageCount,
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const getSingleScholarship = async ({ id }: { id: number }) => {
  try {
    const response = await db.query.scholarship.findFirst({
      where: (scholarship, { eq }) => eq(scholarship.id, id),
      with: {
        organization: {
          columns: { name: true },
        },
      },
    })

    if (!response) return null

    return {
      ...response,
      startDate: response.startDate?.toString(),
      endDate: response.endDate?.toString(),
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const PatchScholarship = async (
  id: number,
  args: ScholarshipModel.UpdateScholarship,
) => {
  try {
    const response = await db
      .update(scholarship)
      .set(args)
      .where(eq(scholarship.id, id)) //para el filtro
      .returning({ id: scholarship.id })
    return response.length
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const getAvailableScholarships = async () => {
  try {
    // Becas activas y dentro de la fecha
    const candidates = await db.query.scholarship.findMany({
      where: sql`${scholarship.active} = true AND ${scholarship.startDate} <= current_date AND ${scholarship.endDate} >= current_date`,
      columns: { id: true, name: true, vacancies: true },
    })

    // Para cada beca se cuenta las aplicaciones aceptadas y se filtra las que aún tienen cupo
    const results: Array<{ id: number; name: string }> = []
    for (const c of candidates) {
      const [countRow] = await db
        .select({ total: sql<number>`count(*)` })
        .from(scholarshipApplication)
        .where(
          sql`${scholarshipApplication.scholarshipId} = ${c.id} AND ${scholarshipApplication.status} = 'accepted'`,
        )

      const accepted = Number(countRow?.total ?? 0)
      const remaining = (c.vacancies ?? 0) - accepted
      if (remaining > 0) results.push({ id: c.id, name: c.name })
    }

    return results
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
