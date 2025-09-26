import { count, eq } from 'drizzle-orm'
import db from '@/db'
import { PostgresError } from '@/db/errors'
import { user } from '@/db/schemas/auth'
import { auth } from '@/lib/auth'

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

export const createFirstOrganization = async (id: string) => {
  try {
    const res = await auth.api.createOrganization({
      body: {
        name: 'Cáritas Lima',
        slug: 'caritas-lima',
        userId: id,
        type: 'caritas',
      },
    })
    if (!res) throw new Error('Failed to create organization')
    const { id: orgId } = res
    const defaultTeams = ['Administración', 'Educación', 'Salud']
    const [{ id: teamId }] = await Promise.all(
      defaultTeams.map((teamName) =>
        auth.api.createTeam({
          body: {
            name: teamName,
            organizationId: orgId,
          },
        }),
      ),
    )
    await auth.api.addTeamMember({
      body: {
        teamId,
        userId: id,
      },
    })
    return orgId
  } catch (error) {
    console.log(error)
    if (error instanceof Error) throw new PostgresError(error.message)
    throw error
  }
}
