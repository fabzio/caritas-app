import { asc, desc, eq, ilike, or } from 'drizzle-orm'
import db from '@/db'
import { PostgresError } from '@/db/errors'
import { organization, user } from '@/db/schemas/auth'
import { scholarship, scholarshipApplication } from '@/db/schemas/education'
import type { ScholarshipRecipientModel } from './model'

export async function getRecipients(
  params: ScholarshipRecipientModel.ListRecipientsQuery,
): Promise<ScholarshipRecipientModel.GetRecipients> {
  try {
    const { q = '', page = 0, limit = 10, sortBy = 'name.asc' } = params

    const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
    const sortField = (sortFieldRaw ?? 'name').trim()
    const sortOrder =
      (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

    const columns = {
      name: user.name,
      surname: user.surname,
      documentType: user.documentType,
      documentNumber: user.documentNumber,
      status: scholarshipApplication.status,
      scholarshipName: scholarship.name,
      organizationName: organization.name,
    } as const

    const column = columns[sortField as keyof typeof columns] ?? user.name
    const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

    const where = q
      ? or(
          ilike(user.name, `%${q}%`),
          ilike(user.surname, `%${q}%`),
          ilike(user.documentNumber, `%${q}%`),
        )
      : undefined

    const rows = await db
      .select(columns)
      .from(scholarshipApplication)
      .innerJoin(user, eq(scholarshipApplication.userId, user.id))
      .innerJoin(
        scholarship,
        eq(scholarshipApplication.scholarshipId, scholarship.id),
      )
      .innerJoin(organization, eq(scholarship.organizationId, organization.id))
      .where(where)
      .offset(page * limit)
      .limit(limit)
      .orderBy(orderExpr)

    return rows
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
