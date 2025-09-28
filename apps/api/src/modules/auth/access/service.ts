import { eq } from 'drizzle-orm'
import db from '@/db'
import { user } from '@/db/schemas/auth'
import { studentInfo } from '@/db/schemas/education'
import { patientInfo } from '@/db/schemas/health'

export const getOrganizationType = async (orgId: string) =>
  await db.query.organization.findMany({
    where: (org, { eq }) => eq(org.id, orgId),
    columns: {
      type: true,
    },
  })
export const getTeam = async (teamId: string) =>
  await db.query.team.findMany({
    where: (team, { eq }) => eq(team.id, teamId),
    columns: {
      name: true,
    },
  })

export const getUserRole = async (userId: string) => {
  const [{ isPatient, isStudent }] = await db
    .select({
      isStudent: studentInfo.userId,
      isPatient: patientInfo.userId,
    })
    .from(user)
    .leftJoin(studentInfo, eq(user.id, studentInfo.userId))
    .leftJoin(patientInfo, eq(user.id, patientInfo.userId))
    .where(eq(user.id, userId))

  return {
    isPatient: !!isPatient,
    isStudent: !!isStudent,
  }
}
