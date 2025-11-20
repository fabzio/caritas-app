import { t } from 'elysia'

export namespace UserModel {
  export const getUserParams = t.Object({
    id: t.String({ minLength: 1 }),
  })
  export type GetUserParams = typeof getUserParams.static

  export const getUserResponse = t.Object({
    id: t.String(),
    fullName: t.String(),
    email: t.String(),
    image: t.Nullable(t.String()),
  })
  export type GetUserResponse = typeof getUserResponse.static

  export const getUserOrganizationsResponse = t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      type: t.Enum({
        caritas: 'caritas',
        health: 'health',
        education: 'education',
        beneficiary: 'beneficiary',
      }),
    }),
  )
  export type GetUserOrganizationsResponse =
    typeof getUserOrganizationsResponse.static
}
