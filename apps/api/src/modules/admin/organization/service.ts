import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization } from '@api/db/schemas/auth'
import { scholarship } from '@api/db/schemas/education'
import { activity, alliedParticipation } from '@api/db/schemas/health'
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  ilike,
  inArray,
  not,
  or,
} from 'drizzle-orm'
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
    eq(organization.active, true),
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
  const normalizedName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // espacios → guiones
    .replace(/[^a-z0-9-]/g, '') // quitar símbolos
    .replace(/--+/g, '-') // evitar doble guión
    .replace(/^-+|-+$/g, '') // quitar guiones al inicio/fin
  const rows = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, normalizedName))
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
export const checkOrganizationsHaveActiveActivities = async (ids: string[]) => {
  try {
    const organizationsWithActivities = await db
      .select({
        organizationId: organization.id,
        organizationName: organization.name,
        activitiesCount: countDistinct(activity.id),
      })
      .from(alliedParticipation)
      .innerJoin(
        organization,
        eq(alliedParticipation.alliedId, organization.id),
      )
      .innerJoin(activity, eq(alliedParticipation.activityId, activity.id))
      .where(
        and(
          inArray(alliedParticipation.alliedId, ids),
          eq(activity.state, true),
        ),
      )
      .groupBy(organization.id, organization.name)
    return organizationsWithActivities
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
