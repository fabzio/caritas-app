import { fairs } from '@api/db/schemas/education'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace FairModel {
  const _getFair = createSelectSchema(fairs, {
    date: t.String(),
  })
  const _createFair = createInsertSchema(fairs)
  export const createFair = t.Omit(_createFair, ['id']) //exclude id
  export type CreateFair = typeof createFair.static //new type more beauty

  export const getFairsResponse = t.Object({
    data: t.Array(
      t.Composite([
        t.Omit(_getFair, ['createdAt', 'updatedAt', 'regionId', 'createdBy']),
        t.Object({
          district: t.String(),
        }),
      ]),
    ),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetFairsResponse = typeof getFairsResponse.static

  export const listFairsQuery = t.Object({
    q: t.Optional(t.String()),
    district: t.Optional(t.String()),
    date: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()),
  })
  export type ListFairsQuery = typeof listFairsQuery.static

  export const getSingleFairsResponse = _getFair
  export type GetSingleFairsResponse = typeof getSingleFairsResponse.static

  export const getSingleFairsQuery = t.Object({
    id: t.String(),
  })
  export type GetSingleFairsQuery = typeof getSingleFairsQuery.static

  export const updateFair = t.Partial(
    t.Omit(_getFair, ['id', 'createdAt', 'updatedAt', 'createdBy']),
  )
  export type UpdateFair = typeof updateFair.static
}
