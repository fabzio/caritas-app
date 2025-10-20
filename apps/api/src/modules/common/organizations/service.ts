import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import type { OrganizationModel } from './model'

export const getOrganizationDetail = async (
  id: string,
): Promise<OrganizationModel.GetOrganizationResponse | null> => {
  try {
    const organization = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.id, id),
      columns: {
        id: true,
        name: true,
        logo: true,
        type: true,
      },
    })
    if (!organization) return null
    return {
      id: organization.id,
      name: organization.name,
      logo: organization.logo ?? null,
      type: organization.type,
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
