import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { scholarshipApplication } from '@api/db/schemas/education'
import { eq, inArray } from 'drizzle-orm'
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

export const getApplicantsByScholarship = async (args: {
  scholarshipId: string
}): Promise<Application.GetApplicantsByScholarshipResponse> => {
  try {
    const scholarship = await db.query.scholarship.findFirst({
      where: (s, { eq }) => eq(s.id, Number(args.scholarshipId)),
    })

    if (!scholarship) {
      throw new PostgresError('No existe la beca solicitada')
    }

    const response = await db.query.scholarshipApplication.findMany({
      where: (app, { eq }) => eq(app.scholarshipId, Number(args.scholarshipId)),
      with: {
        user: true,
      },
    })
    return response.map((app) => {
      const user = app.user as
        | { name: string; surname: string; email: string }
        | undefined
      return {
        id: app.id,
        userName: user ? `${user.name} ${user.surname}` : '',
        userEmail: user ? user.email : '',
        applicationDate: app.applicationDate.toISOString(),
        status: app.status,
      }
    })
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const acceptApplications = async (
  args: Application.AcceptApplicationsBody & { userId: string },
) => {
  try {
    if (!args.userId) throw new PostgresError('El revisor es obligatorio')
    if (!args.ids?.length)
      throw new PostgresError('Debe seleccionar al menos una aplicación')

    const result = await db.transaction(async (tx) => {
      const updated = await tx
        .update(scholarshipApplication)
        .set({
          status: 'accepted',
          reviewedBy: args.userId,
          reviewDate: new Date(),
          comments: args.comments ?? null,
        })
        .where(inArray(scholarshipApplication.id, args.ids))
        .returning({ id: scholarshipApplication.id })

      return updated.map((u) => u.id)
    })

    return result
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
