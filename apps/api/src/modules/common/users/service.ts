import db from '@api/db'
import { user } from '@api/db/schemas/auth'
import { asc, desc, ilike, or } from 'drizzle-orm'
import type { UserModel } from './model'

export async function getUsers(
  params: UserModel.ListUsersQuery,
): Promise<UserModel.GetUsers> {
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

  const where = q
    ? or(
        ilike(user.name, `%${q}%`),
        ilike(user.surname, `%${q}%`),
        ilike(user.documentNumber, `%${q}%`),
      )
    : undefined

  const rows = await db
    .select()
    .from(user)
    .where(where)
    .offset(page * limit)
    .limit(limit)
    .orderBy(orderExpr)

  return rows
}
