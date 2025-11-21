import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { member, organization, user } from '@api/db/schemas/auth'
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

export const updateUser = async (
  id: string,
  data: UserModel.UpdateUserBody,
) => {
  try {
    const existingUser = await db.query.user.findFirst({
      where: (usr, { eq, and, ne }) =>
        and(eq(usr.phone, data.phone), ne(usr.id, id)),
    })

    if (existingUser) {
      throw new Error('Número de teléfono ya en uso')
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        name: data.name,
        surname: data.surname,
        phone: data.phone,
      })
      .where(eq(user.id, id))
      .returning()

    if (!updatedUser) return null

    return {
      name: updatedUser.name,
      surname: updatedUser.surname,
      phone: updatedUser.phone,
    }
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'Número de teléfono ya en uso') {
        throw e
      }
      throw new PostgresError(e.message)
    }
    throw e
  }
}
