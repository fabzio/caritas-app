import { scholarship } from '@api/db/schemas/education'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace ScholarshipModel {
  // create
  const _createScholarship = createInsertSchema(scholarship)
  export const createScholarship = t.Omit(_createScholarship, ['id']) //exclude id
  export type CreateScholarship = typeof createScholarship.static //new type more beauty

  // get
  const _select = createSelectSchema(scholarship)
  const baseItem = t.Omit(_select, ['createdAt', 'updatedAt'])

  // la beca con el nombre de la organización
  export const item = t.Intersect([
    baseItem,
    t.Object({
      organization: t.Optional(
        t.Object({
          id: t.String(),
          name: t.String(),
        }),
      ),
    }),
  ])
  export type Item = typeof item.static

  // lista paginada
  export const paginated = t.Object({
    data: t.Array(item),
    page: t.Number(),
    pageSize: t.Number(),
    total: t.Number(),
    pageCount: t.Number(),
    hasNext: t.Boolean(),
  })

  export type Paginated = typeof paginated.static
  const _getScholarships = createSelectSchema(scholarship)
  export const getScholarship = t.Array(
    t.Omit(_getScholarships, ['createdAt', 'updatedAt']),
  )

  export type GetScholarShip = typeof getScholarship.static

  export const getSingleScholarshipResponse = t.Composite([
    _getScholarships,
    t.Object({
      organization: t.Object({
        name: t.String(),
      }),
    }),
  ])

  export type GetSingleScholarshipResponse =
    typeof getSingleScholarshipResponse.static

  export const getSingleScholarshipQuery = t.Object({
    id: t.String(),
  })
  export type GetSingleScholarshipQuery =
    typeof getSingleScholarshipQuery.static

  export const updateScholarship = t.Partial(
    t.Omit(_getScholarships, ['id', 'createdAt', 'updatedAt', 'createdBy']),
  )
  export type UpdateScholarship = typeof updateScholarship.static

  export const getAvailableScholarships = t.Array(
    t.Pick(_select, ['id', 'name']),
  )
  export type GetAvailableScholarships = typeof getAvailableScholarships.static
}
