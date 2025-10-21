import { speciality } from '@api/db/schemas/health'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace SpecialityModel {
  const _getSpeciality = createSelectSchema(speciality)

  export const getSpecialitiesResponse = t.Object({
    data: t.Array(_getSpeciality),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetSpecialitiesResponse = typeof getSpecialitiesResponse.static

  export const getSpecialities = t.Array(_getSpeciality)
  export type GetSpecialities = typeof getSpecialities.static

  export const listSpecialitiesQuery = t.Object({
    q: t.Optional(t.String()),
    search: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()),
  })
  export type ListSpecialitiesQuery = typeof listSpecialitiesQuery.static

  const _createSpeciality = createInsertSchema(speciality)
  export const createSpeciality = t.Omit(_createSpeciality, ['id'])
  export type CreateSpeciality = typeof createSpeciality.static

  export const updateSpeciality = t.Object({
    name: t.String({
      minLength: 1,
      description: 'Nuevo nombre de la especialidad',
    }),
  })
  export type UpdateSpeciality = typeof updateSpeciality.static

  export const getSingleSpecialityResponse = _getSpeciality
  export type GetSingleSpecialityResponse =
    typeof getSingleSpecialityResponse.static

  export const getSingleSpecialityQuery = t.Object({
    id: t.String({ description: 'ID numérico de la especialidad' }),
  })
  export type GetSingleSpecialityQuery = typeof getSingleSpecialityQuery.static
}
