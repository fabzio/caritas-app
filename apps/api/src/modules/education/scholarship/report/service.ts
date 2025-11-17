import db from '@api/db'
import { member, organization, user } from '@api/db/schemas/auth'
import {
  reportReason,
  scholarship,
  scholarshipStudentReport,
} from '@api/db/schemas/education'
import env from '@api/env'
import { auth } from '@api/lib/auth'
import transporter, { SENDER } from '@api/mail'
import { buildScholarshipReportNotificationTemplate } from '@api/mail/templates'
import { eq } from 'drizzle-orm'
import type { ReportModel } from './model'
/**
 * Crea un nuevo reporte de beca.
 * @returns ID del reporte creado
 */
export async function createScholarshipReport(
  data: ReportModel.CreateScholarshipReport,
  headers?: Headers,
) {
  const [newReason] = await db
    .insert(reportReason)
    .values({
      name: data.reason,
      createdBy: data.reportedBy,
    })
    .returning({ id: reportReason.id })

  const [created] = await db
    .insert(scholarshipStudentReport)
    .values({
      scholarshipId: data.scholarshipId,
      userId: data.userId,
      reportedBy: data.reportedBy,
      cause: data.cause,
      causeDetail: data.causeDetail,
      reason: newReason.id,
      reasonDetail: data.reasonDetail,
    })
    .returning({ id: scholarshipStudentReport.id })

  await sendReportNotificationToEducationMembers(data, headers)

  return created.id
}

async function sendReportNotificationToEducationMembers(
  data: ReportModel.CreateScholarshipReport,
  headers?: Headers,
) {
  const scholarshipData = await db.query.scholarship.findFirst({
    where: eq(scholarship.id, data.scholarshipId),
    columns: {
      id: true,
      name: true,
    },
  })

  if (!scholarshipData) {
    return
  }

  const studentData = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, data.userId),
    columns: {
      name: true,
      surname: true,
    },
  })

  const reporterData = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, data.reportedBy),
    columns: {
      name: true,
      surname: true,
    },
  })

  const caritasOrg = await db.query.organization.findFirst({
    where: eq(organization.type, 'caritas'),
    columns: {
      id: true,
      name: true,
    },
  })

  if (!caritasOrg) {
    return
  }

  const membersResponse = await auth.api.listMembers({
    headers,
    query: {
      organizationId: caritasOrg.id,
      limit: 100,
      filterField: 'role',
      filterOperator: 'contains',
      filterValue: 'educationMember',
    },
  })

  if (!membersResponse?.members || membersResponse.members.length === 0) {
    return
  }

  const educationMembers = membersResponse.members.map((m) => ({
    email: m.user?.email ?? null,
  }))

  const studentName = studentData
    ? `${studentData.name} ${studentData.surname}`.trim()
    : 'Estudiante desconocido'
  const reporterName = reporterData
    ? `${reporterData.name} ${reporterData.surname}`.trim()
    : 'Usuario desconocido'

  const { subject, html } = buildScholarshipReportNotificationTemplate({
    scholarshipName: scholarshipData.name,
    studentName,
    reporterName,
    cause: data.cause,
    baseUrl: env.BETTER_AUTH_URL,
    scholarshipId: scholarshipData.id,
  })

  const emailPromises = educationMembers.map(async (member) => {
    if (!member.email) {
      return
    }
    const result = await transporter.sendMail({
      from: SENDER,
      to: member.email,
      subject,
      html,
    })
    return result
  })

  await Promise.allSettled(emailPromises)
}
