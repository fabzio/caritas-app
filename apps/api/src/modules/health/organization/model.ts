import { organization } from '@api/db/schemas/auth'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace HealthOrganizationModel {
  export const getHealthOrganization = t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      slug: t.Nullable(t.String()),
      logo: t.Nullable(t.String()),
      metadata: t.Nullable(t.String()),
      type: t.Enum({
        caritas: 'caritas',
        education: 'education',
        health: 'health',
        beneficiary: 'beneficiary',
      }),
    }),
  )
  // export const getHealthOrganization = t.Array(
  //   t.Omit(getHealthOrganization, ['createdAt', 'updatedAt']),
  // )
  export type GetHealthOrganization = typeof getHealthOrganization.static

  export const createHealthOrganization = t.Object({
    name: t.String(),
    slug: t.String(),
    logo: t.String(),
    type: t.Enum({
      caritas: 'caritas',
      education: 'education',
      health: 'health',
      beneficiary: 'beneficiary',
    }),
  })
  // export const createHealthOrganization = t.Omit(_createHealthOrganization, ['id'])
  export type CreateHealthOrganization = typeof createHealthOrganization.static
}
