import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization } from '@api/db/schemas/auth'
import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm'
import type { OrganizationModel } from './model'

type GetParams = {
  q?: string
  active?: boolean
  page?: number
  limit?: number
  sortBy?: string
  type?: string
}

export const getOrganization = async ({
  q,
  active,
  page = 0,
  limit = 10,
  sortBy = 'name.asc',
  type = 'education',
}: GetParams): Promise<OrganizationModel.PaginatedOrganization> => {
  try {
    const conditions = [
      eq(
        organization.type,
        type as 'caritas' | 'education' | 'health' | 'beneficiary',
      ),
    ]

    if (q) conditions.push(ilike(organization.name, `%${q}%`))
    if (active !== undefined) conditions.push(eq(organization.active, active))

    const where = and(...conditions)
    const offset = page * limit

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(organization)
      .where(where)

    const [sortField, sortOrder] = sortBy.split('.')

    const validColumns = {
      name: organization.name,
      id: organization.id,
      active: organization.active,
      type: organization.type,
    }

    const orderByClause =
      sortOrder === 'desc'
        ? desc(
            validColumns[sortField as keyof typeof validColumns] ||
              organization.name,
          )
        : asc(
            validColumns[sortField as keyof typeof validColumns] ||
              organization.name,
          )

    const data = await db.query.organization.findMany({
      where,
      columns: {
        createdAt: false,
        updatedAt: false,
      },
      orderBy: orderByClause,
      limit,
      offset,
    })

    const totalPages = Math.ceil(Number(total) / limit)

    return {
      data,
      page,
      limit,
      total: Number(total),
      totalPages,
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
