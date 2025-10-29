import { user } from '@api/db/schemas/auth'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace BeneficiaryModel {
  const _getUser = createSelectSchema(user, {
    birthDate: t.Date(),
  })

  export const getBeneficiariesResponse = t.Object({
    data: t.Array(
      t.Composite([
        t.Pick(_getUser, [
          'id',
          'name',
          'surname',
          'email',
          'documentType',
          'documentNumber',
        ]),
        t.Object({
          insuranceType: t.Union([
            t.Literal('none'),
            t.Literal('public'),
            t.Literal('private'),
          ]),
        }),
      ]),
    ),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetBeneficiariesResponse = typeof getBeneficiariesResponse.static

  export const listBeneficiariesQuery = t.Object({
    q: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()),
  })
  export type ListBeneficiariesQuery = typeof listBeneficiariesQuery.static

  export const getSingleBeneficiaryResponse = t.Composite([
    _getUser,
    t.Object({
      insuranceType: t.Union([
        t.Literal('none'),
        t.Literal('public'),
        t.Literal('private'),
      ]),
    }),
  ])
  export type GetSingleBeneficiaryResponse =
    typeof getSingleBeneficiaryResponse.static

  export const getSingleBeneficiaryQuery = t.Object({
    id: t.String(),
  })
  export type GetSingleBeneficiaryQuery =
    typeof getSingleBeneficiaryQuery.static
}
