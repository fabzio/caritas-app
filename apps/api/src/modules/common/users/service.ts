import db from '@api/db'
import { user } from '@api/db/schemas/auth'
import { asc, count, desc, eq, ilike, or } from 'drizzle-orm'
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

  const where = q
    ? or(
        ilike(user.name, `%${q}%`),
        ilike(user.surname, `%${q}%`),
        ilike(user.documentNumber, `%${q}%`),
      )
    : undefined

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
    data: rows,
    total,
    page,
    limit,
    totalPages,
  }
}

export async function createUser(
  body: UserModel.CreateUserBody,
): Promise<UserModel.CreateUserResponse> {
  const currDate = new Date()

  body.createdAt = currDate
  body.updatedAt = currDate

  const { id } = (
    await db
      .insert(user)
      .values({ ...body })
      .returning({ id: user.id })
  )[0]

  return id
}

export async function updateUser(
  body: UserModel.CreateUserBody,
  query: { id: string },
): Promise<string> {
  body.updatedAt = new Date()

  const res = (
    await db
      .update(user)
      .set({ ...body })
      .where(eq(user.id, query.id))
      .returning()
  )[0]

  return res.id
}
