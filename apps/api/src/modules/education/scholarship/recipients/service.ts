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

export async function createScholarshipRecipient(
  data: ScholarshipRecipientModel.CreateScholarshipRecipient,
): Promise<{ id?: number; error?: string }> {
  try {
    const userExists = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.id, data.userId),
      columns: { id: true },
    })

    if (!userExists) {
      return { error: 'Beneficiario no encontrado' }
    }

    const scholarshipExists = await db.query.scholarship.findFirst({
      where: (scholarships, { eq }) => eq(scholarships.id, data.scholarshipId),
      columns: { id: true },
    })

    if (!scholarshipExists) {
      return { error: 'Beca no encontrada' }
    }

    const existingApplication = await db.query.scholarshipApplication.findFirst(
      {
        where: (application, { eq, and }) =>
          and(
            eq(application.userId, data.userId),
            eq(application.scholarshipId, data.scholarshipId),
          ),
        columns: { id: true, status: true },
      },
    )

    if (existingApplication) {
      if (existingApplication.status === 'accepted') {
        return { error: 'El beneficiario ya ha sido aceptado para esta beca' }
      }

      const [{ id }] = await db
        .update(scholarshipApplication)
        .set({
          status: 'accepted',
          reviewedBy: data.reviewedBy,
          reviewDate: new Date(),
          comments: data.comments ?? null,
        })
        .where(eq(scholarshipApplication.id, existingApplication.id))
        .returning({ id: scholarshipApplication.id })

      return { id }
    }

    const [{ id }] = await db.transaction(async (tx) => {
      return await tx
        .insert(scholarshipApplication)
        .values({
          scholarshipId: data.scholarshipId,
          userId: data.userId,
          applicationDate: new Date(),
          status: 'accepted',
          reviewedBy: data.reviewedBy,
          reviewDate: new Date(),
          comments: data.comments ?? null,
        })
        .returning({ id: scholarshipApplication.id })
    })
    return { id }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

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
    const searchQuery = q.replaceAll(/\s+/g, ' ').trim()

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
      id: scholarshipApplication.id,
      status: scholarshipApplication.status,
      scholarshipName: scholarship.name,
      organizationName: organization.name,
    } as const

    const column = columns[sortField as keyof typeof columns] ?? user.name
    const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

    const queryConditions = or(
      ilike(user.name, `%${searchQuery}%`),
      ilike(user.surname, `%${searchQuery}%`),
      ilike(sql`(${user.name} || ' ' || ${user.surname})`, `%${searchQuery}%`),
      ilike(user.documentType, `%${searchQuery}%`),
      ilike(user.documentNumber, `%${searchQuery}%`),
    )
    const recipientCondition = eq(scholarshipApplication.status, 'accepted')

    const scholarshipCondition =
      selectFilters?.scholarshipName && selectFilters.scholarshipName !== 'all'
        ? eq(scholarship.name, selectFilters.scholarshipName)
        : undefined
    const regionCondition =
      selectFilters?.regionNames && selectFilters.regionNames !== 'all'
        ? eq(region.name, selectFilters.regionNames)
        : undefined

    const conditions = []

    if (searchQuery) conditions.push(queryConditions)
    if (scholarshipCondition) conditions.push(scholarshipCondition)
    if (regionCondition) conditions.push(regionCondition)
    if (recipientCondition) conditions.push(recipientCondition)

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [{ total }] = await db
      .select({ total: count() })
      .from(scholarshipApplication)
      .innerJoin(user, eq(scholarshipApplication.userId, user.id))
      .innerJoin(
        scholarship,
        eq(scholarshipApplication.scholarshipId, scholarship.id),
      )
      .innerJoin(organization, eq(scholarship.organizationId, organization.id))
      .leftJoin(
        organizationLocation,
        eq(organizationLocation.organizationId, organization.id),
      )
      .leftJoin(region, eq(region.id, organizationLocation.regionId))
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
      .leftJoin(
        organizationLocation,
        eq(organizationLocation.organizationId, organization.id),
      )
      .leftJoin(region, eq(region.id, organizationLocation.regionId))
      .where(where)
      .offset(page * limit)
      .limit(limit)
      .orderBy(orderExpr)

    return {
      data: rows.map((r) => ({
        ...r,
        region: r.region || undefined,
      })),
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
