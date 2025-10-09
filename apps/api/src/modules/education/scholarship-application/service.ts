import { eq, inArray } from 'drizzle-orm'
import db from '@/db'
import { PostgresError } from '@/db/errors'
import { scholarshipApplication } from '@/db/schemas/education'
import type { ScholarshipApplicationModel } from './model'

export const createScholarshipApplication = async (
  args: ScholarshipApplicationModel.CreateScholarshipApplication,
) => {
  try {
    const [{ id }] = await db.transaction(async (tx) => {
      return await tx
        .insert(scholarshipApplication)
        .values({
          ...args,
          applicationDate: new Date(),
          status: 'pending',
          reviewedBy: null,
          reviewDate: null,
          comments: args.comments ?? null,
        })
        .returning({
          id: scholarshipApplication.id,
        })
    })
    return id
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}

export const getScholarshipApplications =
  async (): Promise<ScholarshipApplicationModel.GetScholarshipApplication> => {
    try {
      const response = await db.query.scholarshipApplication.findMany()
      return response.map((app) => ({
        ...app,
        applicationDate: app.applicationDate.toISOString(),
        reviewDate: app.reviewDate?.toISOString(),
        comments: app.comments ?? undefined,
        reviewedBy: app.reviewedBy ?? undefined,
      }))
    } catch (e) {
      if (e instanceof Error) throw new PostgresError(e.message)
      throw e
    }
  }

export const getApplicantsByScholarshipId = async (args: {
  scholarship_id: string
}): Promise<ScholarshipApplicationModel.GetApplicantsByScholarshipId> => {
  try {
    const response = await db.query.scholarshipApplication.findMany({
      where: (app, { eq }) =>
        eq(app.scholarshipId, Number(args.scholarship_id)),
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

export const acceptScholarshipApplicationsBatch = async (args: {
  ids: number[]
  userId: string
  comments?: string
}) => {
  try {
    if (!args.userId) throw new PostgresError('Reviewer id is required')

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

export const acceptAllScholarshipApplications = async (args: {
  scholarshipId: number
  userId: string
  comments?: string
}) => {
  try {
    if (!args.userId) throw new PostgresError('Reviewer id is required')

    const result = await db.transaction(async (tx) => {
      const updated = await tx
        .update(scholarshipApplication)
        .set({
          status: 'accepted',
          reviewedBy: args.userId,
          reviewDate: new Date(),
          comments: args.comments ?? null,
        })
        .where(eq(scholarshipApplication.scholarshipId, args.scholarshipId))
        .returning({ id: scholarshipApplication.id })

      return updated.map((u) => u.id)
    })

    return result
  } catch (e) {
    if (e instanceof Error) throw new PostgresError(e.message)
    throw e
  }
}
