import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'
import { PostgresError } from '@/db/errors'
import { scholarshipApplication } from '@/db/schemas/education'

export namespace ScholarshipApplicationModel {
  const _createScholarshipApplication = createInsertSchema(
    scholarshipApplication,
  )
  export const createScholarshipApplication = t.Object({
    scholarshipId: t.Number(),
    userId: t.String(),
    comments: t.Optional(t.String()),
  })
  export type CreateScholarshipApplication =
    typeof createScholarshipApplication.static

  export const acceptScholarshipApplication = t.Object({
    id: t.Number(),
    userId: t.String(),
    comments: t.Optional(t.String()),
  })
  export type AcceptScholarshipApplication =
    typeof acceptScholarshipApplication.static

  const _getScholarshipApplications = createSelectSchema(scholarshipApplication)
  export const getScholarshipApplication = t.Array(
    t.Object({
      id: t.Number(),
      scholarshipId: t.Number(),
      userId: t.String(),
      applicationDate: t.String(),
      status: t.Enum({
        pending: 'pending',
        accepted: 'accepted',
        rejected: 'rejected',
      }),
      reviewedBy: t.Optional(t.String()),
      reviewDate: t.Optional(t.String()),
      comments: t.Optional(t.String()),
    }),
  )

  export type GetScholarshipApplication =
    typeof getScholarshipApplication.static

  export class DuplicateApplicationError extends PostgresError {
    name: string
    constructor() {
      super('Student has already applied to this scholarship')
      this.name = 'DuplicateApplicationError'
    }
  }
}
