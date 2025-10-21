import { t } from 'elysia'

export namespace Application {
  export const createScholarshipApplicationBody = t.Object({
    userId: t.String(),
    scholarshipId: t.Integer(),
  })
  export type CreateScholarshipApplicationBody =
    typeof createScholarshipApplicationBody.static
}
