import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { speciality } from '@api/db/schemas/health'
import { normalizeText } from '@api/utils/normalize-text'
import { asc, desc, eq } from 'drizzle-orm'
import type { SpecialityModel } from './model'

export async function getSpecialities(
  params: SpecialityModel.ListSpecialitiesQuery,
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
    where: (speciality, { eq }) => eq(speciality.id, id),
  })
  return data ?? null
}

export const createSpeciality = async (
  args: SpecialityModel.CreateSpeciality,
) => {
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
  const { data: coincidences } = await getSpecialities({ q: name })

  if (!coincidences?.length) return null

  const excluded = coincidences.find((s) => s.id !== excludeId)

  return excluded || null
}
