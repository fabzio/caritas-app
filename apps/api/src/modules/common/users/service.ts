import db from '@api/db'
import { PostgresError } from '@api/db/errors'
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
