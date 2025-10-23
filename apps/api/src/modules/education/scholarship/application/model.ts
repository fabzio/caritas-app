import { t } from 'elysia'

export namespace Application {
  export const createScholarshipApplicationBody = t.Object({
    userId: t.String(),
    scholarshipId: t.Integer(),
  })
  export type CreateScholarshipApplicationBody =
    typeof createScholarshipApplicationBody.static

  export const getApplicantsByScholarshipResponse = t.Array(
    t.Object({
      id: t.Number(),
      userName: t.String(),
      userEmail: t.String(),
      applicationDate: t.String(),
      status: t.Enum({
        pending: 'pending',
        accepted: 'accepted',
        rejected: 'rejected',
      }),
    }),
  )

  export type GetApplicantsByScholarshipResponse =
    typeof getApplicantsByScholarshipResponse.static

  export const acceptApplicationsBody = t.Object({
    ids: t.Array(t.Number()),
    comments: t.Optional(t.String()),
  })
  export type AcceptApplicationsBody = typeof acceptApplicationsBody.static
}
