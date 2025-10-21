import { t } from 'elysia'

export namespace OrganizationModel {
  export const getOrganizationParams = t.Object({
    id: t.String({ minLength: 1 }),
  })
  export type GetOrganizationParams = typeof getOrganizationParams.static

  export const getOrganizationResponse = t.Object({
    id: t.String(),
    name: t.String(),
    logo: t.Nullable(t.String()),
    type: t.Enum({
      caritas: 'caritas',
      education: 'education',
      health: 'health',
      beneficiary: 'beneficiary',
    }),
  })
  export type GetOrganizationResponse = typeof getOrganizationResponse.static
}
