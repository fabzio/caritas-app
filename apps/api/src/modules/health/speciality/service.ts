import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { speciality } from '@api/db/schemas/health'
import type { SpecialityModel } from './model'

export const createSpeciality = async (
  args: SpecialityModel.CreateSpeciality,
) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx.insert(speciality).values(args).returning({
        id: speciality.id,
      })
    })
    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const getSpecialities =
  async (): Promise<SpecialityModel.GetSpecialities> => {
    try {
      const response = await db.query.speciality.findMany()
      return response
    } catch (e) {
      if (e instanceof Error) throw new PostgresError(e.message)
      throw e
    }
  }
