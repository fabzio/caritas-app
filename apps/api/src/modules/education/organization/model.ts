import { organization } from '@api/db/schemas/auth'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace OrganizationModel {
  const _getOrganization = createSelectSchema(organization)

  export const getOrganization = t.Array(
    t.Omit(_getOrganization, ['createdAt', 'updatedAt']),
  )

  export type GetOrganization = typeof getOrganization.static

  export const organizationItem = t.Omit(_getOrganization, [
    'createdAt',
    'updatedAt',
  ])

  export const paginatedOrganization = t.Object({
    data: t.Array(organizationItem),
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  })

  export type PaginatedOrganization = typeof paginatedOrganization.static
}
