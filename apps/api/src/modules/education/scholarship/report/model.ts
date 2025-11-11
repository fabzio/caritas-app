import { scholarshipStudentReport } from '@api/db/schemas/education'
import { createInsertSchema } from 'drizzle-typebox'
import { t } from 'elysia'
export namespace ReportModel {
  const _createScholarshipReport = createInsertSchema(scholarshipStudentReport)
  const baseSchema = t.Omit(t.Object(_createScholarshipReport.properties), [
    'createdAt',
    'updatedAt',
    'reason',
  ])

  export const createScholarshipReport = t.Composite([
    baseSchema,
    t.Object({
      reason: t.String({
        description: 'Nombre del motivo del reporte (se crea en report_reason)',
      }),
    }),
  ])

  // 🧩 Tipo inferido
  export type CreateScholarshipReport = typeof createScholarshipReport.static
}
