import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import type { OrganizationModel } from './model'

export const getOrganization =
  async (): Promise<OrganizationModel.GetOrganization> => {
    try {
      return await db.query.organization.findMany({
        where: (org, { eq, and }) =>
          and(eq(org.type, 'education'), eq(org.active, true)),
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
