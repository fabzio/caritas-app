import { t } from 'elysia'

export namespace PatientModel {
  export const entity = t.Object({
    userId: t.String(),
    insuranceType: t.Enum({
      none: 'none',
      public: 'public',
      private: 'private',
    }),
  })
  export type Entity = typeof entity.static

  export const params = t.Object({
    userId: t.String(),
  })
  export type Params = typeof params.static

  export const create = entity
  export type Create = typeof create.static

  export const update = t.Object({
    insuranceType: t.Enum({
      none: 'none',
      public: 'public',
      private: 'private',
    }),
  })
  export type Update = typeof update.static

  export const createResponse = t.Object({
    ok: t.Boolean(),
  })

  export const notFound = t.Literal('Patient info not found')

  export const getResponse = {
    200: entity,
    404: notFound,
  } as const

  export const patchResponse = {
    200: entity,
    404: notFound,
  } as const
}
