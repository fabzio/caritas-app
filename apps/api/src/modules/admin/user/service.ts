import db from '@api/db'
import { member, team, teamMember, user } from '@api/db/schemas/auth'
import { and, asc, count, desc, eq, ilike, inArray, or } from 'drizzle-orm'
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
    role && role !== 'all' ? ilike(member.role, `%${role}%`) : undefined
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

  const userIds = rows.map(({ user: row }) => row.id)

  const allMemberships =
    userIds.length > 0
      ? await db
          .select({ userId: member.userId, role: member.role })
          .from(member)
          .where(
            and(
              eq(member.organizationId, params.organizationId),
              or(...userIds.map((id) => eq(member.userId, id))),
            ),
          )
      : []

  const userRolesMap = allMemberships.reduce(
    (acc, membership) => {
      if (!acc[membership.userId]) {
        acc[membership.userId] = []
      }
      if (!acc[membership.userId].includes(membership.role)) {
        acc[membership.userId].push(membership.role)
      }
      return acc
    },
    {} as Record<string, string[]>,
  )

  const totalPages = Math.ceil(total / limit)

  return {
    data: rows.map(({ user: row }) => {
      const userRoles = userRolesMap[row.id] || []
      return {
        ...row,
        role: userRoles.join(',') || null,
        birthDate: new Date(row.birthDate),
      }
    }),
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

export const getTeamsByIds = async (teamIds: string[]) => {
  if (teamIds.length === 0) return []
  const rows = await db
    .select({
      id: team.id,
      name: team.name,
    })
    .from(team)
    .where(inArray(team.id, teamIds))
  return rows
}

export const getUserTeamIds = async (userId: string) => {
  const rows = await db
    .select({
      teamId: teamMember.teamId,
    })
    .from(teamMember)
    .where(eq(teamMember.userId, userId))
  return rows.map((row) => row.teamId)
}

export const getUserRoles = async (userId: string, organizationId: string) => {
  const rows = await db
    .select({
      role: member.role,
    })
    .from(member)
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
    )
  return rows.map((row) => row.role)
}

export const getMemberId = async (userId: string, organizationId: string) => {
  const res = await db.query.member.findFirst({
    where: (member, { and, eq }) =>
      and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
    columns: {
      id: true,
    },
  })
  return res ? res.id : null
}

export async function getBeneficiaries(): Promise<UserModel.GetBeneficiariesResponse> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      surname: user.surname,
      documentType: user.documentType,
      documentNumber: user.documentNumber,
      active: user.active,
    })
    .from(user)
    .where(and(eq(user.active, true), eq(user.role, 'user')))
    .orderBy(asc(user.name))

  return rows
}
