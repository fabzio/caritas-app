import { organization } from '@api/db/schemas/auth'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace OrganizationModel {
  const _getOrganization = createSelectSchema(organization)

  export const getOrganization = t.Array(
    t.Omit(_getOrganization, ['createdAt', 'updatedAt']),
  ) //exclud some columns

  export type GetOrganization = typeof getOrganization.static
}
