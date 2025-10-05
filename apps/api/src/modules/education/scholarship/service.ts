import db from '@/db'
import { PostgresError } from '@/db/errors'
import { scholarship } from '@/db/schemas/education'
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
