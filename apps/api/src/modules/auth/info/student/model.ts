import { t } from 'elysia'

export namespace StudentModel {
  export const entity = t.Object({
    userId: t.String(),
    grade: t.String(),
    guardianEmail: t.String(),
  })
  export type Entity = typeof entity.static

  export const params = t.Object({
    userId: t.String(),
  })
  export type Params = typeof params.static

  export const create = entity
  export type Create = typeof create.static

  export const update = t.Object({
    grade: t.Optional(t.String()),
    guardianEmail: t.Optional(t.String()),
  })
  export type Update = typeof update.static

  export const createResponse = t.Object({
    ok: t.Boolean(),
  })

  export const notFound = t.Literal('Student info not found')

  export const getResponse = {
    200: entity,
    404: notFound,
  } as const

  export const patchResponse = {
    200: entity,
    404: notFound,
  } as const
}
