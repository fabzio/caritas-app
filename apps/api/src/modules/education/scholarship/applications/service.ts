import db from '@api/db'
import { PostgresError } from '@api/db/errors'
import { scholarshipApplication } from '@api/db/schemas/education'
import { eq, inArray } from 'drizzle-orm'
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

export const acceptScholarshipApplication = async (
  args: ScholarshipApplicationModel.AcceptScholarshipApplication,
) => {
  try {
    if (!args.userId) throw new PostgresError('Reviewer id is required')
    const [{ id: updatedId }] = await db.transaction(async (tx) => {
      return await tx
        .update(scholarshipApplication)
        .set({
          status: 'accepted',
          reviewedBy: args.userId,
          reviewDate: new Date(),
          comments: args.comments ?? null,
        })
        .where(eq(scholarshipApplication.id, args.scholarship_id))
        .returning({ id: scholarshipApplication.id })
    })
    if (updatedId == null)
      throw new PostgresError('Scholarship application not found')
    return updatedId
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
  scholarshipId: string
}): Promise<ScholarshipApplicationModel.GetApplicantsByScholarshipId> => {
  try {
    const response = await db.query.scholarshipApplication.findMany({
      where: (app, { eq }) => eq(app.scholarshipId, Number(args.scholarshipId)),
      with: {
        user: true,
      },
    })
    return response.map((app) => {
      const user = app.user
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
