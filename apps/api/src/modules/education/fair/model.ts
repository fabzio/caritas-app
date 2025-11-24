import { fair } from '@api/db/schemas/education'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-typebox'
import { t } from 'elysia'

export namespace FairModel {
  const assistanceCountValue = t.Integer({
    minimum: 0,
    description: 'Cantidad de asistentes',
  })
  const assistanceCountSchema = t.Optional(
    t.Union([assistanceCountValue, t.Null()]),
  )
  const _getFair = createSelectSchema(fair, {
    date: t.Date(),
    assistanceCount: assistanceCountSchema,
  })
  export type GetFair = typeof _getFair.static
  const baseFair = createInsertSchema(fair, {
    assistanceCount: assistanceCountSchema,
  })
  export const createFair = t.Intersect([
    baseFair,
    t.Object({
      organizations: t.Array(
        t.Object({
          organizationId: t.String({ minLength: 1 }),
        }),
      ),
    }),
  ])

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

  export const getSingleFairsResponse = t.Composite([
    _getFair,
    t.Object({
      organizations: t.Array(
        t.Object({
          id: t.String(),
          name: t.String(),
        }),
      ),
    }),
  ])
  export type GetSingleFairsResponse = typeof getSingleFairsResponse.static

  export const getSingleFairsQuery = t.Object({
    id: t.String(),
  })
  export type GetSingleFairsQuery = typeof getSingleFairsQuery.static

  const baseUpdate = createUpdateSchema(fair, {
    assistanceCount: assistanceCountSchema,
  })
  export const _updateFair = t.Intersect([
    baseUpdate,
    t.Object({
      organizations: t.Array(
        t.Object({
          organizationId: t.String({ minLength: 1 }),
        }),
      ),
    }),
  ])
  export const updateFair = _updateFair
  export type UpdateFair = typeof updateFair.static

  export const deleteFairs = t.Object({
    ids: t.Array(t.Integer({ minimum: 1 })),
  })
  export type DeleteFairs = typeof deleteFairs.static

  export const getAttendanceResponse = t.Object({
    data: t.Array(
      t.Object({
        id: t.Integer(),
        title: t.String(),
        date: t.Date(),
        district: t.String(),
        assistanceCount: assistanceCountSchema,
        fourthGradeAssistance: assistanceCountSchema,
        fifthGradeAssistance: assistanceCountSchema,
        status: t.Union([
          t.Literal('upcoming'),
          t.Literal('ongoing'),
          t.Literal('finished'),
        ]),
      }),
    ),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetAttendanceResponse = typeof getAttendanceResponse.static

  export const updateAttendance = t.Object({
    assistanceCount: assistanceCountSchema,
    fourthGradeAssistance: assistanceCountSchema,
    fifthGradeAssistance: assistanceCountSchema,
  })
  export type UpdateAttendance = typeof updateAttendance.static
}
