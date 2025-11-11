import db from '@api/db'
import {
  reportReason,
  scholarshipStudentReport,
} from '@api/db/schemas/education'
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
