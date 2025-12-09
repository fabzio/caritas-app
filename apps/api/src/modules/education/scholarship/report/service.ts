import db from '@api/db'
import { member, organization, user } from '@api/db/schemas/auth'
import {
  reportReason,
  scholarship,
  scholarshipStudentReport,
} from '@api/db/schemas/education'
import env from '@api/env'
import transporter, { SENDER } from '@api/mail'
import { buildScholarshipReportNotificationTemplate } from '@api/mail/templates'
import { and, desc, eq, ilike, like, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { status } from 'elysia'
import type { ReportModel } from './model'
/**
 * Crea un nuevo reporte de beca.
 * @returns ID del reporte creado
 */
export async function createScholarshipReport(
  data: ReportModel.CreateScholarshipReport,
) {
  let reasonId: number | undefined

  if (data.reason) {
    const [newReason] = await db
      .insert(reportReason)
      .values({
        name: data.reason,
        createdBy: data.reportedBy,
      })
      .returning({ id: reportReason.id })
    reasonId = newReason.id
  }

  const [created] = await db
    .insert(scholarshipStudentReport)
    .values({
      scholarshipId: data.scholarshipId,
      userId: data.userId,
      reportedBy: data.reportedBy,
      cause: data.cause,
      causeDetail: data.causeDetail,
      reason: reasonId,
      reasonDetail: data.reasonDetail,
    })
    .returning({ id: scholarshipStudentReport.id })

  await sendReportNotificationToEducationMembers(data)

  return created.id
}

export async function updateScholarshipReportReason(
  reportId: number,
  data: ReportModel.UpdateReportReason,
  userId: string,
) {
  const existingReport = await db.query.scholarshipStudentReport.findFirst({
    where: eq(scholarshipStudentReport.id, reportId),
    columns: {
      id: true,
      reason: true,
    },
  })

  if (!existingReport) {
    throw status(404, 'Reporte no encontrado')
  }

  if (existingReport.reason) {
    throw status(409, 'El reporte ya tiene un motivo registrado')
  }

  const [newReason] = await db
    .insert(reportReason)
    .values({
      name: data.reason,
      createdBy: userId,
    })
    .returning({ id: reportReason.id })

  await db
    .update(scholarshipStudentReport)
    .set({
      reason: newReason.id,
      reasonDetail: data.reasonDetail,
      updatedAt: new Date(),
    })
    .where(eq(scholarshipStudentReport.id, reportId))

  return { success: true }
}

export async function getScholarshipReports(
  args: ReportModel.ListReportsQuery,
) {
  const page = args.page ?? 1
  const pageSize = args.pageSize ?? 10
  const offset = (page - 1) * pageSize
  const studentUser = alias(user, 'student_user')
  const reporterUser = alias(user, 'reporter_user')

  const filters = [
    eq(scholarshipStudentReport.scholarshipId, args.scholarshipId),
  ]

  if (args.search) {
    const searchValue = `%${args.search}%`
    filters.push(
      or(
        ilike(studentUser.name, searchValue),
        ilike(studentUser.surname, searchValue),
        ilike(studentUser.email, searchValue),
      ),
    )
  }

  let whereClause: ReturnType<typeof and> | (typeof filters)[number] | undefined
  if (filters.length > 1) {
    whereClause = and(...filters)
  } else if (filters.length === 1) {
    whereClause = filters[0]
  }

  const countBuilder = db
    .select({ total: sql<number>`count(*)` })
    .from(scholarshipStudentReport)
    .leftJoin(studentUser, eq(scholarshipStudentReport.userId, studentUser.id))

  const [countResult] = await (whereClause
    ? countBuilder.where(whereClause)
    : countBuilder)

  const total = Number(countResult?.total ?? 0)

  let rowsBuilder = db
    .select({
      id: scholarshipStudentReport.id,
      scholarshipId: scholarshipStudentReport.scholarshipId,
      scholarshipName: scholarship.name,
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentSurname: studentUser.surname,
      studentEmail: studentUser.email,
      studentPhone: studentUser.phone,
      cause: scholarshipStudentReport.cause,
      causeDetail: scholarshipStudentReport.causeDetail,
      reasonId: reportReason.id,
      reasonName: reportReason.name,
      reasonDetail: scholarshipStudentReport.reasonDetail,
      reportedById: reporterUser.id,
      reportedByName: reporterUser.name,
      reportedBySurname: reporterUser.surname,
      reportedByEmail: reporterUser.email,
      createdAt: scholarshipStudentReport.createdAt,
      updatedAt: scholarshipStudentReport.updatedAt,
    })
    .from(scholarshipStudentReport)
    .innerJoin(
      scholarship,
      eq(scholarship.id, scholarshipStudentReport.scholarshipId),
    )
    .leftJoin(studentUser, eq(scholarshipStudentReport.userId, studentUser.id))
    .leftJoin(
      reporterUser,
      eq(scholarshipStudentReport.reportedBy, reporterUser.id),
    )
    .leftJoin(
      reportReason,
      eq(scholarshipStudentReport.reason, reportReason.id),
    )

  if (whereClause) {
    rowsBuilder = rowsBuilder.where(whereClause)
  }

  rowsBuilder = rowsBuilder
    .orderBy(desc(scholarshipStudentReport.createdAt))
    .offset(offset)
    .limit(pageSize)

  const rows = await rowsBuilder

  const data = rows.map((row) => ({
    id: row.id,
    scholarship: {
      id: row.scholarshipId,
      name: row.scholarshipName,
    },
    student: {
      id: row.studentId ?? '',
      name: `${row.studentName ?? ''} ${row.studentSurname ?? ''}`.trim(),
      email: row.studentEmail ?? '',
      phone: row.studentPhone ?? '',
    },
    cause: row.cause,
    causeDetail: row.causeDetail ?? undefined,
    reason: {
      id: row.reasonId ?? undefined,
      name: row.reasonName ?? undefined,
    },
    reasonDetail: row.reasonDetail ?? undefined,
    reportedBy: {
      id: row.reportedById ?? undefined,
      name:
        row.reportedByName || row.reportedBySurname
          ? `${row.reportedByName ?? ''} ${row.reportedBySurname ?? ''}`.trim()
          : undefined,
      email: row.reportedByEmail ?? undefined,
    },
    createdAt: row.createdAt?.toISOString() ?? '',
    updatedAt: row.updatedAt?.toISOString() ?? '',
  }))

  const pageCount = pageSize ? Math.ceil(total / pageSize) : 0

  return {
    data,
    page,
    pageSize,
    total,
    pageCount,
  }
}

async function sendReportNotificationToEducationMembers(
  data: ReportModel.CreateScholarshipReport,
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

  const educationMembers = await db.query.member.findMany({
    where: and(
      eq(member.organizationId, caritasOrg.id),
      like(member.role, '%educationMember%'),
    ),
    with: {
      user: {
        columns: {
          email: true,
        },
      },
    },
  })

  if (!educationMembers || educationMembers.length === 0) {
    return
  }

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

  const emailPromises = educationMembers.map(async (memberData) => {
    if (!memberData.user.email) {
      return
    }
    const result = await transporter.sendMail({
      from: SENDER,
      to: memberData.user.email,
      subject,
      html,
    })
    return result
  })

  await Promise.allSettled(emailPromises)
}
