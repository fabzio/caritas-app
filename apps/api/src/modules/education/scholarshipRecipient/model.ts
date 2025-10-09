import { createInsertSchema } from 'drizzle-typebox'
import { t } from 'elysia'
import { scholarshipApplication } from '@/db/schemas/education'

export namespace ScholarshipRecipientModel {
  const listScholarshipRecipients = t.Object({
    name: t.String(),
    surname: t.String(),
    documentType: t.Nullable(t.String()),
    documentNumber: t.String(),
    region: t.String(),
    status: t.String(),
    scholarshipName: t.String(),
    organizationName: t.String(),
  })
  export const getlistScholarshipRecipientsResponse = t.Object({
    data: t.Array(listScholarshipRecipients),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })

  export type GetRecipients = typeof getlistScholarshipRecipientsResponse.static
  export const listRecipientsQuery = t.Object({
    q: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()),
    selectFilters: t.Optional(
      t.Object({
        scholarshipName: t.Optional(t.String()),
        regionNames: t.Optional(t.String()),
      }),
    ),
  })
  export type ListRecipientsQuery = typeof listRecipientsQuery.static

  export const getSelectNamesResponse = t.Object({
    scholarshipNames: t.Array(t.String()),
    regionNames: t.Array(t.String()),
  })
  export type GetScholarshipNames = typeof getSelectNamesResponse.static

  const _createScholarshipRecipient = createInsertSchema(scholarshipApplication)
  export const createScholarshipRecipient = t.Pick(
    _createScholarshipRecipient,
    ['scholarshipId', 'userId', 'comments'],
  )
  export type CreateScholarshipRecipient =
    typeof createScholarshipRecipient.static
}
