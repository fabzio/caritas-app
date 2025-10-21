import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { scholarshipApplication } from '@api/db/schemas/education'
import { eq } from 'drizzle-orm'
import type { Application } from './model'

export const createScholarshipApplication = async (
  args: Application.CreateScholarshipApplicationBody,
) => {
  try {
    const res = await db
      .select()
      .from(scholarshipApplication)
      .where(eq(scholarshipApplication.userId, args.userId))
    if (res.length > 0)
      throw new Error('El usuario ya ha postulado a dicha oportunidad')

    const [{ id }] = await db.transaction(async (tx) => {
      return await tx
        .insert(scholarshipApplication)
        .values({
          scholarshipId: args.scholarshipId,
          userId: args.userId,
          applicationDate: new Date(),
          status: 'pending',
        })
        .returning({ id: scholarshipApplication.id })
    })
    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
