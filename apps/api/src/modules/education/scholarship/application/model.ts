import { t } from 'elysia'

export namespace Application {
  export const createScholarshipApplicationBody = t.Object({
    userId: t.String(),
    scholarshipId: t.Integer(),
  })
  export type CreateScholarshipApplicationBody =
    typeof createScholarshipApplicationBody.static

  export const getApplicantsByScholarshipResponse = t.Object({
    applicants: t.Array(
      t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        applicationDate: t.String(),
        status: t.Enum({
          pending: 'pending',
          accepted: 'accepted',
          rejected: 'rejected',
        }),
      }),
    ),
    vacancies: t.Object({
      total: t.Number(),
      accepted: t.Number(),
      remaining: t.Number(),
    }),
  })

  export type GetApplicantsByScholarshipResponse =
    typeof getApplicantsByScholarshipResponse.static

  export const acceptApplicationsBody = t.Object({
    ids: t.Array(t.Number()),
    comments: t.Optional(t.String()),
  })
  export type AcceptApplicationsBody = typeof acceptApplicationsBody.static

  export const rejectRecipientsBody = t.Object({
    ids: t.Array(t.Number()),
    comments: t.Optional(t.String()),
  })
  export type RejectRecipientsBody = typeof rejectRecipientsBody.static

  export const checkApplicationStatusResponse = t.Union([
    t.Object({
      hasApplied: t.Literal(true),
      status: t.Enum({
        pending: 'pending',
        accepted: 'accepted',
        rejected: 'rejected',
      }),
      applicationDate: t.String(),
    }),
    t.Object({
      hasApplied: t.Literal(false),
    }),
  ])
  export type CheckApplicationStatusResponse =
    typeof checkApplicationStatusResponse.static
}
