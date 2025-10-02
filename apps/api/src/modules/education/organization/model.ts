import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'
import { organizationMajor } from '@/db/schemas/education'

export namespace OrganizationMayorModel {
  const _createOrganizationMajor = createInsertSchema(organizationMajor)
  export const createOrganizationMajor = t.Omit(_createOrganizationMajor, [
    'id',
  ]) //exclude id
  export type CreateOrganizationMajor = typeof createOrganizationMajor.static //new type more beauty

  const _getOrganizationMajors = createSelectSchema(organizationMajor)

  export const getOrganizationMajors = t.Array(
    t.Omit(_getOrganizationMajors, ['createdAt', 'updatedAt']),
  ) //exclud some columns

  export type GetOrganizationMajors = typeof getOrganizationMajors.static
}
