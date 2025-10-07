import db from '@api/db'
import { user } from '@api/db/schemas/auth'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { UserModel } from './model'

export async function getUsers(
  params: UserModel.ListUsersQuery,
): Promise<UserModel.GetUsersResponse> {
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

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(user)
    .where(where)

  // Get paginated data
  const rows = await db
    .select()
    .from(user)
    .where(where)
    .offset(page * limit)
    .limit(limit)
    .orderBy(orderExpr)

  const totalPages = Math.ceil(total / limit)

  return {
    data: rows.map((row) => ({
      ...row,
      birthDate: new Date(row.birthDate),
    })),
    total,
    page,
    limit,
    totalPages,
  }
}

export async function getSingleUser({
  params: { id },
}: {
  params: UserModel.GetSingleUserQuery
}): Promise<UserModel.GetSingleUserResponse> {
  const data = await db.select().from(user).where(eq(user.id, id))
  return {
    ...data[0],
    birthDate: new Date(data[0].birthDate),
  }
}
