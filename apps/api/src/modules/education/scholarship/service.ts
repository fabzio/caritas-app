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
      const rows = await db.query.scholarship.findMany({
        columns: {
          createdAt: false,
          updatedAt: false,
        },
      })
      // para que las fechas vayan como string
      const response = rows.map((r) => ({
        ...r,
        startDate: r.startDate.toString(),
        endDate: r.endDate.toString(),
      }))
      return response
    } catch (e) {
      if (e instanceof Error) throw new PostgresError(e.message)
      throw e
    }
  }
