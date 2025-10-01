import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'
import { scholarship } from '@/db/schemas/education'

export namespace ScholarshipModel {
  const _createScholarship = createInsertSchema(scholarship)
  export const createScholarship = t.Omit(_createScholarship, ['id']) //exclude id
  export type CreateScholarship = typeof createScholarship.static //new type more beauty

  const _getScholarships = createSelectSchema(scholarship)
  export const getScholarship = t.Array(
    t.Omit(_getScholarships, ['createdAt', 'updatedAt']),
  )

  export type GetScholarShip = typeof getScholarship.static
}
