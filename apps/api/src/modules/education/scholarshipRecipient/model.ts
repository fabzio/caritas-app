import { t } from 'elysia'

export namespace ScholarshipRecipientModel {
  export const listScholarshipRecipients = t.Array(
    t.Object({
      name: t.String(),
      surname: t.String(),
      documentType: t.Nullable(t.String()),
      documentNumber: t.String(),
      region: t.String(),
      status: t.String(),
      scholarshipName: t.String(),
      organizationName: t.String(),
    }),
  )
  export type GetScholarshipRecipients = typeof listScholarshipRecipients.static

  export type GetRecipients = typeof listScholarshipRecipients.static
  export const listRecipientsQuery = t.Object({
    q: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()),
  })
  export type ListRecipientsQuery = typeof listRecipientsQuery.static
}
