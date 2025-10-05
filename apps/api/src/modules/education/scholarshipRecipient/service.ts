import { asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm'
import db from '@/db'
import { PostgresError } from '@/db/errors'
import { organization, region, user } from '@/db/schemas/auth'
import {
  organizationLocation,
  scholarship,
  scholarshipApplication,
} from '@/db/schemas/education'
import type { ScholarshipRecipientModel } from './model'

export async function getRecipients(
  params: ScholarshipRecipientModel.ListRecipientsQuery,
): Promise<ScholarshipRecipientModel.GetRecipients> {
  try {
    const { q = '', page = 0, limit = 10, sortBy = 'name.asc' } = params
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

    console.log({ page, limit })

    const column = columns[sortField as keyof typeof columns] ?? user.name
    const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

    const where = searchQuery
      ? or(
          ilike(user.name, `%${searchQuery}%`),
          ilike(user.surname, `%${searchQuery}%`),
          ilike(
            sql`(${user.name} || ' ' || ${user.surname})`,
            `%${searchQuery}%`,
          ),
          ilike(user.documentType, `%${searchQuery}%`),
          ilike(user.documentNumber, `%${searchQuery}%`),
          ilike(scholarship.name, `%${searchQuery}%`),
          ilike(organization.name, `%${searchQuery}%`),
          ilike(region.name, `%${searchQuery}%`),
        )
      : undefined

    // Pagination
    const [{ total }] = await db
      .select({ total: count() })
      .from(user)
      .where(where)

    const totalPages = Math.ceil(total / limit)

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
