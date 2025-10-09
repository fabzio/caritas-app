import { speciality } from '@api/db/schemas/health'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace SpecialityModel {
  const _createSpeciality = createInsertSchema(speciality)
  export const createSpeciality = t.Omit(_createSpeciality, ['id'])
  export type CreateSpeciality = typeof createSpeciality.static

  const _getSpecialities = createSelectSchema(speciality)
  export const getSpecialities = t.Array(
    t.Omit(_getSpecialities, ['createdAt', 'updatedAt']),
  )

  export type GetSpecialities = typeof getSpecialities.static
}
