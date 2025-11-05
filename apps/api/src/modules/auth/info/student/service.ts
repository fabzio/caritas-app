import db from '@api/db'
import { studentInfo } from '@api/db/schemas/education'
import { eq } from 'drizzle-orm'
import type { StudentModel } from './model'

const selection = {
  userId: studentInfo.userId,
  grade: studentInfo.grade,
  guardianEmail: studentInfo.guardianEmail,
}

export const createStudentInfo = async (params: StudentModel.Create) => {
  await db.insert(studentInfo).values({
    userId: params.userId,
    grade: params.grade,
    guardianEmail: params.guardianEmail,
  })
}

export const findStudentInfo = async (userId: string) =>
  db.query.studentInfo.findFirst({
    where: (students, { eq: equals }) => equals(students.userId, userId),
    columns: {
      userId: true,
      grade: true,
      guardianEmail: true,
    },
  })

export const updateStudentInfo = async (
  userId: string,
  params: StudentModel.Update,
) => {
  const updatePayload: Partial<typeof studentInfo.$inferInsert> = {}

  if (params.grade !== undefined) updatePayload.grade = params.grade
  if (params.guardianEmail !== undefined)
    updatePayload.guardianEmail = params.guardianEmail

  if (!Object.keys(updatePayload).length) {
    const existing = await findStudentInfo(userId)
    return existing ?? null
  }

  const [updated] = await db
    .update(studentInfo)
    .set(updatePayload)
    .where(eq(studentInfo.userId, userId))
    .returning(selection)

  return updated ?? null
}
