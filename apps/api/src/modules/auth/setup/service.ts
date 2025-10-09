import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { user } from '@api/db/schemas/auth'
import { auth } from '@api/lib/auth'
import { count, eq } from 'drizzle-orm'

export const isFirstUser = async () => {
  try {
    const [{ userCount }] = await db
      .select({
        userCount: count(),
      })
      .from(user)

    return userCount === 1
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}

export const setFirstUserAsAdmin = async (id: string) => {
  try {
    await db.update(user).set({ role: 'admin' }).where(eq(user.id, id))
  } catch (error) {
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}
