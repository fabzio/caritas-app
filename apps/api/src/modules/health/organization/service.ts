import db from '@/db'
import { PostgresError } from '@/db/errors'
import { organization } from '@/db/schemas/auth'
import type { HealthOrganizationModel } from './model'

export const createHealthOrganization = async (
  args: HealthOrganizationModel.CreateHealthOrganization,
) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx.insert(organization).values(args).returning({
        id: organization.id,
      })
    })
    return id
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const getHealthOrganizations =
  async (): Promise<HealthOrganizationModel.GetHealthOrganization> => {
    try {
      return await db.query.organization.findMany({
        columns: {
          createdAt: false,
          updatedAt: false,
        },
        where: (org, { eq }) => eq(org.type, 'health'),
      })
    } catch (e) {
      if (e instanceof Error) throw new PostgresError(e.message)
      throw e
    }
  }
