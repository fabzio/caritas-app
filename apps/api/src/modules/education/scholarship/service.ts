import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { scholarship } from '@api/db/schemas/education'
import { ilike, sql } from 'drizzle-orm'
import type { ScholarshipModel } from './model'

// para la paginación
type GetParams = {
  name?: string
  page?: number // página actual
  pageSize?: number // elementos por página
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
  page = 1,
  pageSize = 10,
}: GetParams): Promise<ScholarshipModel.Paginated> => {
  try {
    // con filtrado por nombre
    const where = name ? ilike(scholarship.name, `%${name}%`) : undefined
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
    // una página con becas
    const rows = await db.query.scholarship.findMany({
      where,
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      with: {
        // con el nombre de la organización
        organization: {
          columns: { id: true, name: true },
        },
      },
      limit: pageSize,
      offset,
      // esto puede servir para futuro filtrado y ordenamiento
      // orderBy: (s, { desc }) => [desc(s.createdAt)],
    })
    // fechas como string
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
