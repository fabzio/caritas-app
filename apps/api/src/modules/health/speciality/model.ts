import { speciality } from '@api/db/schemas/health'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace SpecialityModel {
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

  const _getSpecialities = createSelectSchema(speciality)
  export const getSpecialities = t.Array(
    t.Omit(_getSpecialities, ['createdAt', 'updatedAt']),
  )
  export type GetSpecialities = typeof getSpecialities.static

  export const getSingleSpecialityResponse = _getSpecialities
  export type GetSingleSpecialityResponse =
    typeof getSingleSpecialityResponse.static

  export const getSingleSpecialityQuery = t.Object({
    id: t.String({ description: 'ID numérico de la especialidad' }),
  })
  export type GetSingleSpecialityQuery = typeof getSingleSpecialityQuery.static
}
