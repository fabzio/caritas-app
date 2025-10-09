import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { organization, region, user } from '@api/db/schemas/auth'
import {
  organizationLocation,
  scholarship,
  scholarshipApplication,
} from '@api/db/schemas/education'
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm'
import type { ScholarshipRecipientModel } from './model'

export async function getRecipients(
  params: ScholarshipRecipientModel.ListRecipientsQuery,
): Promise<ScholarshipRecipientModel.GetRecipients> {
  try {
    const {
      q = '',
      selectFilters = { scholarshipName: 'all', regionNames: 'all' },
      page = 0,
      limit = 10,
      sortBy = 'name.asc',
    } = params
    const searchQuery = q.replace(/\s+/g, ' ').trim()

    const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
    const sortField = (sortFieldRaw ?? 'name').trim()
    const sortOrder =
      (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

    const columns = {
      name: user.name,
      surname: user.surname,
      documentType: user.documentType,
      documentNumber: user.documentNumber,
      region: region.name,
      status: scholarshipApplication.status,
      scholarshipName: scholarship.name,
      organizationName: organization.name,
    } as const

    const column = columns[sortField as keyof typeof columns] ?? user.name
    const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

    // Basic conditions

    const queryConditions = or(
      ilike(user.name, `%${searchQuery}%`),
      ilike(user.surname, `%${searchQuery}%`),
      ilike(sql`(${user.name} || ' ' || ${user.surname})`, `%${searchQuery}%`),
      ilike(user.documentType, `%${searchQuery}%`),
      ilike(user.documentNumber, `%${searchQuery}%`),
    )
    const recipientCondition = eq(scholarshipApplication.status, 'accepted')

    // Select conditions

    const scholarshipCondition =
      selectFilters?.scholarshipName && selectFilters.scholarshipName !== 'all'
        ? eq(scholarship.name, selectFilters.scholarshipName)
        : undefined
    const regionCondition =
      selectFilters?.regionNames && selectFilters.regionNames !== 'all'
        ? eq(region.name, selectFilters.regionNames)
        : undefined

    // Final where condition

    const conditions = []

    if (searchQuery) conditions.push(queryConditions)
    if (scholarshipCondition) conditions.push(scholarshipCondition)
    if (regionCondition) conditions.push(regionCondition)
    if (recipientCondition) conditions.push(recipientCondition)

    const where = conditions.length > 0 ? and(...conditions) : undefined

    // Pagination
    const [{ total }] = await db
      .select({ total: count() })
      .from(scholarshipApplication)
      .innerJoin(user, eq(scholarshipApplication.userId, user.id))
      .innerJoin(
        scholarship,
        eq(scholarshipApplication.scholarshipId, scholarship.id),
      )
      .innerJoin(organization, eq(scholarship.organizationId, organization.id))
      .innerJoin(
        organizationLocation,
        eq(organizationLocation.organizationId, organization.id),
      )
      .innerJoin(region, eq(region.id, organizationLocation.regionId))
      .where(where)

    const totalPages = Math.ceil(total / limit)

    // Main query
    const rows = await db
      .select(columns)
      .from(scholarshipApplication)
      .innerJoin(user, eq(scholarshipApplication.userId, user.id))
      .innerJoin(
        scholarship,
        eq(scholarshipApplication.scholarshipId, scholarship.id),
      )
      .innerJoin(organization, eq(scholarship.organizationId, organization.id))
      .innerJoin(
        organizationLocation,
        eq(organizationLocation.organizationId, organization.id),
      )
      .innerJoin(region, eq(region.id, organizationLocation.regionId))
      .where(where)
      .offset(page * limit)
      .limit(limit)
      .orderBy(orderExpr)

    return {
      data: rows,
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

export async function getSelectNamesResponse(): Promise<ScholarshipRecipientModel.GetScholarshipNames> {
  try {
    const regions = await db.query.region.findMany({
      columns: { name: true },
      orderBy: asc(region.name),
    })
    const team = await db.query.scholarship.findMany({
      columns: { name: true },
      orderBy: asc(scholarship.name),
    })
    return {
      scholarshipNames: team.map((t) => t.name),
      regionNames: regions.map((r) => r.name),
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
