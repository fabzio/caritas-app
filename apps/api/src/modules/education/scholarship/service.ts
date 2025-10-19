import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { scholarship } from '@api/db/schemas/education'
import type { ScholarshipModel } from './model'
export const createScholarship = async (
  args: ScholarshipModel.CreateScholarship,
) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx.insert(scholarship).values(args).returning({
        id: scholarship.id,
      })
    })
    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
export const getScholarships =
  async (): Promise<ScholarshipModel.GetScholarShip> => {
    try {
      const response = await db.query.scholarship.findMany({
        columns: {
          createdAt: false,
          updatedAt: false,
        },
      })
      return response
    } catch (e) {
      if (e instanceof Error) throw new PostgresError(e.message)
      throw e
    }
  }

export const getSingleScholarship = async ({ id }: { id: number }) => {
  try {
    const response = await db.query.scholarship.findFirst({
      where: (scholarship, { eq }) => eq(scholarship.id, id),
    })

    if (!response) return null

    return {
      ...response,
      startDate: response.startDate?.toString(),
      endDate: response.endDate?.toString(),
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
