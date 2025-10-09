import { user } from '@api/db/schemas/auth'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace UserModel {
  const _getUsers = createSelectSchema(user, {
    birthDate: t.Date(),
  })
  export const getUsersResponse = t.Object({
    data: t.Array(_getUsers),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetUsersResponse = typeof getUsersResponse.static
  export const getUsers = t.Array(_getUsers)
  export type GetUsers = typeof getUsers.static
  export const listUsersQuery = t.Object({
    organizationId: t.String(),
    q: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()), // ej: "name.asc"
  })
  export type ListUsersQuery = typeof listUsersQuery.static

  export const getSingleUserResponse = t.Composite([
    _getUsers,
    t.Object({
      teams: t.Array(
        t.Object({
          id: t.String(),
          name: t.String(),
        }),
      ),
    }),
  ])
  export type GetSingleUserResponse = typeof getSingleUserResponse.static
  export const getSingleUserQuery = t.Object({
    id: t.String(),
  })
  export type GetSingleUserQuery = typeof getSingleUserQuery.static

  export const createUser = t.Object({
    userId: t.String(),
    teamId: t.String(),
    organizationId: t.String(),
  })
  export type CreateUser = typeof createUser.static
}
