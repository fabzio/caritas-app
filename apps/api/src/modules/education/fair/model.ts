import { fair } from '@api/db/schemas/education'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-typebox'
import { t } from 'elysia'

export namespace FairModel {
  const _getFair = createSelectSchema(fair, {
    date: t.Date(),
  })
  export type GetFair = typeof _getFair.static
  export const createFair = createInsertSchema(fair)
  export type CreateFair = typeof createFair.static

  export const getFairsResponse = t.Object({
    data: t.Array(
      t.Composite([
        t.Omit(_getFair, ['createdAt', 'updatedAt', 'regionId', 'createdBy']),
        t.Object({
          district: t.String(),
          status: t.Union([
            t.Literal('upcoming'),
            t.Literal('ongoing'),
            t.Literal('finished'),
          ]),
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
    status: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()),
  })
  export type ListFairsQuery = typeof listFairsQuery.static

  export const getSingleFairsResponse = t.Composite([_getFair, t.Object({})])
  export type GetSingleFairsResponse = typeof getSingleFairsResponse.static

  export const getSingleFairsQuery = t.Object({
    id: t.String(),
  })
  export type GetSingleFairsQuery = typeof getSingleFairsQuery.static

  const _updateFair = createUpdateSchema(fair)
  export const updateFair = _updateFair
  export type UpdateFair = typeof updateFair.static
}
