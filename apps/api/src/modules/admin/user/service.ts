import db from '@api/db'
import { member, user } from '@api/db/schemas/auth'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { UserModel } from './model'

export async function getUsers(
  params: UserModel.ListUsersQuery,
): Promise<UserModel.GetUsersResponse> {
  const { q = '', role, page = 0, limit = 10, sortBy = 'name.asc' } = params

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

  const roleCondition =
    role && role !== 'all' ? eq(member.role, role) : undefined
  const activeCondition = eq(user.active, true)
  const memberOrgCondition = eq(member.organizationId, params.organizationId)
  const where = and(
    activeCondition,
    searchCondition,
    roleCondition,
    memberOrgCondition,
  )

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(user)
    .innerJoin(member, eq(user.id, member.userId))
    .where(where)

  // Get paginated data
  const rows = await db
    .select({ user: user, role: member.role })
    .from(user)
    .innerJoin(member, eq(user.id, member.userId))
    .where(where)
    .offset(page * limit)
    .limit(limit)
    .orderBy(orderExpr)

  const totalPages = Math.ceil(total / limit)

  return {
    data: rows.map(({ user: row, role }) => ({
      ...row,
      role,
      birthDate: new Date(row.birthDate),
    })),
    total,
    page,
    limit,
    totalPages,
  }
}

export async function getSingleUser(id: string) {
  const data = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  })

  const teams = await db.query.teamMember.findMany({
    where: (teamMember, { eq }) => eq(teamMember.userId, id),
    with: {
      team: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  })
  return data
    ? {
        ...data,
        birthDate: new Date(data?.birthDate),
        teams: teams.map(({ team }) => team),
      }
    : null
}

export const getTeamName = async (teamId: string) => {
  const team = await db.query.team.findFirst({
    where: (team, { eq }) => eq(team.id, teamId),
    columns: {
      name: true,
    },
  })
  return team?.name ?? null
}
