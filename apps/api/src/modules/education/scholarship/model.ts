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
  export const item = t.Omit(_select, ['createdAt', 'updatedAt'])
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
}
