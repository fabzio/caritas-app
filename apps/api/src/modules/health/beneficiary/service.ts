import db from '@api/db'
import { user } from '@api/db/schemas/auth'
import { patientInfo } from '@api/db/schemas/health'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { BeneficiaryModel } from './model'

export async function getHealthBeneficiaries(
  params: BeneficiaryModel.ListBeneficiariesQuery,
): Promise<BeneficiaryModel.GetBeneficiariesResponse> {
  const { q = '', page = 0, limit = 10, sortBy = 'name.asc' } = params

  const [sortFieldRaw, sortOrderRaw] = (sortBy ?? 'name.asc').split('.', 2)
  const sortField = (sortFieldRaw ?? 'name').trim()
  const sortOrder =
    (sortOrderRaw ?? 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc'

  const columns = {
    name: user.name,
    surname: user.surname,
    email: user.email,
    createdAt: user.createdAt,
    documentNumber: user.documentNumber,
  } as const

  const column = columns[sortField as keyof typeof columns] ?? user.name
  const orderExpr = sortOrder === 'desc' ? desc(column) : asc(column)

  const searchCondition = q
    ? or(
        ilike(user.name, `%${q}%`),
        ilike(user.surname, `%${q}%`),
        ilike(user.documentNumber, `%${q}%`),
      )
    : undefined

  const activeCondition = eq(user.active, true)
  const where = and(activeCondition, searchCondition)

  const [{ total }] = await db
    .select({ total: count() })
    .from(user)
    .innerJoin(patientInfo, eq(user.id, patientInfo.userId))
    .where(where)

  const rows = await db
    .select({
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        documentType: user.documentType,
        documentNumber: user.documentNumber,
      },
      insuranceType: patientInfo.insuranceType,
    })
    .from(user)
    .innerJoin(patientInfo, eq(user.id, patientInfo.userId))
    .where(where)
    .offset(page * limit)
    .limit(limit)
    .orderBy(orderExpr)

  const totalPages = Math.ceil(total / limit)

  return {
    data: rows.map(({ user: row, insuranceType }) => {
      return {
        ...row,
        insuranceType,
      }
    }),
    total,
    page,
    limit,
    totalPages,
  }
}

export async function getSingleHealthBeneficiary(id: string) {
  const data = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  })

  if (!data) return null

  const patientData = await db.query.patientInfo.findFirst({
    where: (patientInfo, { eq }) => eq(patientInfo.userId, id),
  })

  if (!patientData) return null

  return {
    ...data,
    birthDate: new Date(data.birthDate),
    insuranceType: patientData.insuranceType,
  }
}
