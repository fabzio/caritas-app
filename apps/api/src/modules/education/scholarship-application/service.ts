import { eq } from 'drizzle-orm'
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
        .where(eq(scholarshipApplication.id, args.id))
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
