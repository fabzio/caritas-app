import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { user } from '@api/db/schemas/auth'
import { scholarshipApplication } from '@api/db/schemas/education'
import { and, count, eq, ilike, inArray, or } from 'drizzle-orm'
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

export const getAcceptedUsers = async (args: {
  scholarshipId: number
  name?: string
}) => {
  const results = await db
    .select({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      applicationDate: scholarshipApplication.applicationDate,
    })
    .from(scholarshipApplication)
    .leftJoin(user, eq(scholarshipApplication.userId, user.id))
    .where(
      and(
        eq(scholarshipApplication.scholarshipId, args.scholarshipId),
        eq(scholarshipApplication.status, 'accepted'),
        args.name
          ? or(
              ilike(user.name, `%${args.name}%`),
              ilike(user.surname, `%${args.name}%`),
            )
          : undefined,
      ),
    )

  return {
    data: results.map((r) => ({
      id: r.id ?? '',
      name: `${r.name ?? ''} ${r.surname ?? ''}`.trim(),
      email: r.email ?? '',
      applicationDate: r.applicationDate ? r.applicationDate.toISOString() : '',
    })),
  }
}

export const getApplicantsByScholarship = async (args: {
  scholarshipId: string
}): Promise<Application.GetApplicantsByScholarshipResponse> => {
  try {
    const scholarship = await db.query.scholarship.findFirst({
      where: (s, { eq }) => eq(s.id, Number(args.scholarshipId)),
      columns: {
        vacancies: true,
      },
    })

    if (!scholarship) {
      throw new PostgresError('No existe la beca solicitada')
    }

    const response = await db.query.scholarshipApplication.findMany({
      where: (app, { eq }) => eq(app.scholarshipId, Number(args.scholarshipId)),
      columns: {
        id: true,
        applicationDate: true,
        status: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            surname: true,
            email: true,
          },
        },
      },
    })

    const acceptedCount = response.filter(
      (app) => app.status === 'accepted',
    ).length

    const remainingVacancies = Math.max(
      0,
      scholarship.vacancies - acceptedCount,
    )

    return {
      applicants: response.map((app) => {
        const user = app.user
        return {
          id: app.id,
          name: user ? `${user.name} ${user.surname}` : '',
          email: user ? user.email : '',
          applicationDate: app.applicationDate.toISOString(),
          status: app.status,
        }
      }),
      vacancies: {
        total: scholarship.vacancies,
        accepted: acceptedCount,
        remaining: remainingVacancies,
      },
    }
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
      const applications = await tx
        .select({
          scholarshipId: scholarshipApplication.scholarshipId,
        })
        .from(scholarshipApplication)
        .where(inArray(scholarshipApplication.id, args.ids))
        .limit(1)

      if (!applications.length) {
        throw new PostgresError(
          'No se encontraron las aplicaciones seleccionadas',
        )
      }

      const scholarshipId = applications[0].scholarshipId

      const scholarship = await tx.query.scholarship.findFirst({
        where: (s, { eq }) => eq(s.id, scholarshipId),
        columns: {
          vacancies: true,
        },
      })

      if (!scholarship) {
        throw new PostgresError('No se encontró la beca')
      }

      const [{ value: currentAccepted }] = await tx
        .select({ value: count() })
        .from(scholarshipApplication)
        .where(
          and(
            eq(scholarshipApplication.scholarshipId, scholarshipId),
            eq(scholarshipApplication.status, 'accepted'),
          ),
        )

      const remainingVacancies = Math.max(
        0,
        scholarship.vacancies - currentAccepted,
      )

      if (args.ids.length > remainingVacancies) {
        throw new PostgresError(
          `Solo queda${remainingVacancies === 1 ? '' : 'n'} ${remainingVacancies} vacante${remainingVacancies === 1 ? '' : 's'} disponible${remainingVacancies === 1 ? '' : 's'}. No se pueden aceptar ${args.ids.length} aplicación${args.ids.length === 1 ? '' : 'es'}.`,
        )
      }

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

export async function rejectScholarshipRecipients(
  args: Application.RejectRecipientsBody & { userId: string },
) {
  try {
    if (!args.userId) throw new PostgresError('El revisor es obligatorio')
    if (!args.ids?.length)
      throw new PostgresError('Debe seleccionar al menos una aplicación')

    const result = await db.transaction(async (tx) => {
      const updated = await tx
        .update(scholarshipApplication)
        .set({
          status: 'rejected',
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
