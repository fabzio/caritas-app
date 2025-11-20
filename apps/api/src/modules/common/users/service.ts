import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { member, organization } from '@api/db/schemas/auth'
import { and, eq } from 'drizzle-orm'
import type { UserModel } from './model'

export const getUserDetail = async (
  id: string,
): Promise<UserModel.GetUserResponse | null> => {
  try {
    const user = await db.query.user.findFirst({
      where: (usr, { eq }) => eq(usr.id, id),
      columns: {
        id: true,
        name: true,
        surname: true,
        email: true,
        image: true,
      },
    })
    if (!user) return null
    return {
      id: user.id,
      fullName: `${user.name} ${user.surname}`.trim(),
      email: user.email,
      image: user.image ?? null,
    }
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const getUserOrganizations = async (
  id: string,
): Promise<UserModel.GetUserOrganizationsResponse> => {
  const res = await db
    .select({
      id: organization.id,
      name: organization.name,
      type: organization.type,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(and(eq(member.userId, id), eq(organization.active, true)))
  return res
}
