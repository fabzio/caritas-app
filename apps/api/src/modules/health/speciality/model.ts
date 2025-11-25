import { speciality } from '@api/db/schemas/health'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace SpecialityModel {
  const _getSpeciality = createSelectSchema(speciality)
  const _getSpecialityPublic = t.Omit(_getSpeciality, ['active'])

  export const getSpecialitiesResponse = t.Object({
    data: t.Array(_getSpecialityPublic),
    total: t.Integer(),
    page: t.Integer(),
    limit: t.Integer(),
    totalPages: t.Integer(),
  })
  export type GetSpecialitiesResponse = typeof getSpecialitiesResponse.static

  export const getSpecialitiesQuery = t.Object({
    q: t.Optional(t.String()),
    page: t.Optional(t.Integer({ minimum: 0 })),
    limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
    sortBy: t.Optional(t.String()),
  })
  export type GetSpecialitiesQuery = typeof getSpecialitiesQuery.static

  const _createSpeciality = createInsertSchema(speciality)
  export const createSpeciality = t.Omit(_createSpeciality, ['id', 'active'])
  export type CreateSpeciality = typeof createSpeciality.static

  export const updateSpeciality = t.Object({
    name: t.String({
      minLength: 1,
      description: 'Nuevo nombre de la especialidad',
    }),
  })
  export type UpdateSpeciality = typeof updateSpeciality.static

  export const getSingleSpecialityResponse = _getSpecialityPublic
  export type GetSingleSpecialityResponse =
    typeof getSingleSpecialityResponse.static

  export const getSingleSpecialityQuery = t.Object({
    id: t.String({ description: 'ID numérico de la especialidad' }),
  })
  export type GetSingleSpecialityQuery = typeof getSingleSpecialityQuery.static

  export const deleteSpecialities = t.Object({
    ids: t.Array(t.Integer({ minimum: 1 })),
  })
  export type DeleteSpecialities = typeof deleteSpecialities.static

  export const deleteSpecialitiesWithActivities = t.Object({
    specialitiesWithActivities: t.Array(
      t.Object({
        specialityId: t.String(),
        specialityName: t.String(),
        activityCount: t.Number(),
      }),
    ),
  })
  export type DeleteSpecialitiesWithActivities =
    typeof deleteSpecialitiesWithActivities.static
}
