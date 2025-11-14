import db from '@api/db'
import { user } from '@api/db/schemas/auth'
import {
  reportReason,
  scholarship,
  scholarshipStudentReport,
} from '@api/db/schemas/education'
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import type { ReportModel } from './model'
/**
 * Crea un nuevo reporte de beca.
 * @returns ID del reporte creado
 */
export async function createScholarshipReport(
  data: ReportModel.CreateScholarshipReport,
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

  return created.id
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
