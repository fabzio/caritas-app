import db from '@/db'
import { PostgresError } from '@/db/errors'
import type { OrganizationMayorModel } from './model'

export const getOrganizationMajors =
  async (): Promise<OrganizationMayorModel.GetOrganizationMajors> => {
    try {
      return await db.query.organizationMajor.findMany({
        columns: {
          createdAt: false,
          updatedAt: false,
        },
      })
    } catch (e) {
      if (e instanceof Error) throw new PostgresError(e.message)
      throw e
    }
  }
