import { scholarship } from '@api/db/schemas/education'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace ScholarshipModel {
  const _createScholarship = createInsertSchema(scholarship)
  export const createScholarship = t.Omit(_createScholarship, ['id']) //exclude id
  export type CreateScholarship = typeof createScholarship.static //new type more beauty

  const _getScholarships = createSelectSchema(scholarship)
  export const getScholarship = t.Array(
    t.Omit(_getScholarships, ['createdAt', 'updatedAt']),
  )

  export type GetScholarShip = typeof getScholarship.static

  export const getSingleScholarshipResponse = _getScholarships
  export type GetSingleScholarshipResponse =
    typeof getSingleScholarshipResponse.static

  export const getSingleScholarshipQuery = t.Object({
    id: t.String(),
  })
  export type GetSingleScholarshipQuery =
    typeof getSingleScholarshipQuery.static
}
