import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { speciality } from '@api/db/schemas/health'
import { eq } from 'drizzle-orm'
import type { SpecialityModel } from './model'

interface GetSpecialitiesArgs {
  search?: string
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

export async function getSingleSpeciality(id: number) {
  const data = await db.query.speciality.findFirst({
    where: (speciality, { eq }) => eq(speciality.id, id),
  })
  return data ?? null
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

export const updateSpeciality = async (
  id: number,
  args: SpecialityModel.UpdateSpeciality,
) => {
  try {
    const result = await db
      .update(speciality)
      .set({ name: args.name })
      .where(eq(speciality.id, id))
      .returning()
    return result[0] ?? null
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
