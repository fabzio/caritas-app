import { t } from 'elysia'

export namespace UserModel {
  const _getUsers = t.Object({
    id: t.String(),
    name: t.String(),
    surname: t.String(),
    email: t.String(),
    emailVerified: t.Boolean(),
    image: t.Nullable(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    role: t.Nullable(t.String()),
    banned: t.Nullable(t.Boolean()),
    banReason: t.Nullable(t.String()),
    isAnonymous: t.Nullable(t.Boolean()),
    banExpires: t.Nullable(t.Date()),
    documentType: t.Nullable(t.String()),
    documentNumber: t.Nullable(t.String()),
    sex: t.String(),
    birthDate: t.Date(),
    phone: t.String(),
    regionId: t.Integer(),
  })
  export const getUsers = t.Array(_getUsers)
  export type GetUsers = typeof getUsers.static
  export const listUsersQuery = t.Object({
    q: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()), // ej: "name.asc"
  })
  export type ListUsersQuery = typeof listUsersQuery.static
  export const createUserBody = t.Object({
    name: t.String(),
    surname: t.String(),
    email: t.String(),
    emailVerified: t.Boolean(),
    image: t.Nullable(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    role: t.Nullable(t.String()),
    banned: t.Nullable(t.Boolean()),
    banReason: t.Nullable(t.String()),
    isAnonymous: t.Nullable(t.Boolean()),
    banExpires: t.Nullable(t.Date()),
    documentType: t.String(),
    documentNumber: t.String(),
    sex: t.Union([t.Literal('F'), t.Literal('M')]),
    birthDate: t.String(),
    phone: t.String(),
    regionId: t.Integer(),
  })
  export type CreateUserBody = typeof createUserBody.static
  export const createUserResponse = t.String()
  export type CreateUserResponse = typeof createUserResponse.static
}
