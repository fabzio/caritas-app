import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { speciality } from '@api/db/schemas/health'
import type { SpecialityModel } from './model'

interface GetSpecialitiesArgs {
  search?: string
}

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

export const getSpecialities = async ({
  query,
}: {
  query: GetSpecialitiesArgs
}): Promise<SpecialityModel.GetSpecialities> => {
  try {
    const { search } = query

    const response = await db.query.speciality.findMany({
      where: search
        ? (fields, { ilike }) => ilike(fields.name, `%${search}%`)
        : undefined,
    })
    return response
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
