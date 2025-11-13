import { organization } from '@api/db/schemas/auth'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace OrganizationModel {
  const _getOrganizations = createSelectSchema(organization)
  export const getOrganization = t.Object({
    data: t.Array(_getOrganizations),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetOrganization = typeof getOrganization.static

  export const listOrganizationsQuery = t.Object({
    q: t.Optional(t.String()),
    type: t.Optional(
      t.Enum({
        education: 'education',
        health: 'health',
        beneficiary: 'beneficiary',
      }),
    ),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()), // ej: "name.asc"
  })
  export type ListOrganizationsQuery = typeof listOrganizationsQuery.static

  export const getSingleOrganizationResponse = _getOrganizations
  export type GetSingleOrganizationResponse =
    typeof getSingleOrganizationResponse.static

  export const getSingleOrganizationQuery = t.Object({
    id: t.String(),
  })
  export type GetSingleOrganizationQuery =
    typeof getSingleOrganizationQuery.static

  export const createOrganization = t.Object({
    name: t.String(),
    type: t.Enum({
      caritas: 'caritas',
      education: 'education',
      health: 'health',
      beneficiary: 'beneficiary',
    }),
    logo: t.String(),
  })
  export type CreateOrganization = typeof createOrganization.static

  export const updateOrganization = t.Object({
    name: t.String({
      minLength: 1,
      description: 'Nuevo nombre del aliado',
    }),
  })
  export type updateOrganization = typeof updateOrganization.static

  export const deleteOrganizations = t.Object({
    ids: t.Array(t.String({ minimum: 1 })),
  })
  export type deleteOrganizations = typeof deleteOrganizations.static

  export const deleteOrganizationsWithScholarships = t.Object({
    organizationsWithScholarships: t.Array(
      t.Object({
        organizationId: t.String(),
        organizationName: t.String(),
        scholarshipCount: t.Number(),
      }),
    ),
  })
  export type DeleteOrganizationsWithScholarships =
    typeof deleteOrganizationsWithScholarships.static
}
