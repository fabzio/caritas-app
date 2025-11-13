import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization } from '@api/db/schemas/auth'
import { scholarship } from '@api/db/schemas/education'
import { and, asc, count, desc, eq, ilike, inArray, not, or } from 'drizzle-orm'
import type { OrganizationModel } from './model'

export async function getOrganizations(
  params: OrganizationModel.ListOrganizationsQuery & {
    organizationId: string
  },
): Promise<OrganizationModel.GetOrganization> {
  const {
    q = '',
    page = 0,
    limit = 10,
    sortBy = 'name.asc',
    type,
    active,
    organizationId,
  } = params

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
  const activeCondition =
    active !== undefined ? eq(organization.active, active) : undefined
  const typeCondition = type ? eq(organization.type, type) : undefined
  const where = and(
    activeCondition,
    searchCondition,
    typeCondition,
    not(eq(organization.id, organizationId)),
  )

  const [{ total }] = await db
    .select({ total: count() })
    .from(organization)
    .where(where)

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
export async function getOrganizationsSimple(name: string) {
  const rows = await db
    .select()
    .from(organization)
    .where(ilike(organization.name, `%${name}%`))
  return {
    data: rows,
  }
}

export async function getSingleOrganization({ id }: { id: string }) {
  const data = await db.query.organization.findFirst({
    where: (organization, { eq }) => eq(organization.id, id),
  })
  return data ?? null
}

export const updateOrganization = async (
  id: string,
  args: OrganizationModel.updateOrganization,
) => {
  try {
    const result = await db
      .update(organization)
      .set({ name: args.name })
      .where(eq(organization.id, id))
      .returning()
    return result[0] ?? null
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export async function findDuplicateOrganizations(
  name: string,
  organizationId: string,
) {
  const { data: coincidences } = await getOrganizationsSimple(name)

  if (!coincidences?.length) return null

  const excluded = coincidences.find((s) => s.id !== organizationId)

  return excluded || null
}

export const deleteOrganizations = async (ids: string[]) => {
  try {
    await db
      .update(organization)
      .set({ active: false })
      .where(inArray(organization.id, ids))
    return { success: true }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const checkOrganizationsHaveActiveScholarships = async (
  ids: string[],
) => {
  try {
    const organizationsWithScholarships = await db
      .select({
        organizationId: scholarship.organizationId,
        organizationName: organization.name,
        scholarshipCount: count(scholarship.id),
      })
      .from(scholarship)
      .innerJoin(organization, eq(scholarship.organizationId, organization.id))
      .where(
        and(
          inArray(scholarship.organizationId, ids),
          eq(scholarship.active, true),
        ),
      )
      .groupBy(scholarship.organizationId, organization.name)

    return organizationsWithScholarships
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
