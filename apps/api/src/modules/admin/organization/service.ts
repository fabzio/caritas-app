import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization } from '@api/db/schemas/auth'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { OrganizationModel } from './model'

export const createOrganization = async (
  args: OrganizationModel.CreateOrganization,
) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      const insertorg = {
        name: args.name,
        logo: args.logo,
        type: args.type,
        slug: args.name.toLowerCase().replace(' ', '-'),
        metadata: '',
      }
      return await tx.insert(organization).values(insertorg).returning({
        id: organization.id,
      })
    })
    return id
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export async function getOrganizations(
  params: OrganizationModel.ListOrganizationsQuery,
): Promise<OrganizationModel.GetOrganization> {
  const { q = '', page = 0, limit = 10, sortBy = 'name.asc' } = params

  const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
  const sortField = (sortFieldRaw ?? 'name').trim()
  const sortOrder =
    (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

  const columns = {
    id: organization.id,
    name: organization.name,
  } as const

  const column = columns[sortField as keyof typeof columns] ?? organization.name
  const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

  const searchCondition = q ? or(ilike(organization.name, `%${q}%`)) : undefined

  const activeCondition = eq(organization.active, true)
  const where = and(activeCondition, searchCondition)

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(organization)
    .where(where)

  // Get paginated data
  const rows = await db
    .select()
    .from(organization)
    .where(where)
    .offset(page * limit)
    .limit(limit)
    .orderBy(orderExpr)

  const totalPages = Math.ceil(total / limit)

  return {
    data: rows,
    total,
    page,
    limit,
    totalPages,
  }
}

export async function getSingleOrganization({ id }: { id: string }) {
  const data = await db.query.organization.findFirst({
    where: (organization, { eq }) => eq(organization.id, id),
  })
  return data ? data : null
}
