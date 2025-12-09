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
      reason: t.Optional(
        t.String({
          description:
            'Nombre del motivo del reporte (se crea en report_reason)',
        }),
      ),
    }),
  ])

  // 🧩 Tipo inferido
  export type CreateScholarshipReport = typeof createScholarshipReport.static

  export const listReportsQuery = t.Object({
    scholarshipId: t.Numeric(),
    search: t.Optional(
      t.String({
        description: 'Búsqueda por nombre o correo del becado reportado',
      }),
    ),
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 50, default: 10 })),
  })

  export const scholarshipReport = t.Object({
    id: t.Number(),
    scholarship: t.Object({
      id: t.Number(),
      name: t.String(),
    }),
    student: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
      phone: t.String(),
    }),
    cause: t.Enum({
      absence: 'absence',
      performance: 'performance',
      other: 'other',
    }),
    causeDetail: t.Optional(t.String()),
    reason: t.Object({
      id: t.Optional(t.Number()),
      name: t.Optional(t.String()),
    }),
    reasonDetail: t.Optional(t.String()),
    reportedBy: t.Object({
      id: t.Optional(t.String()),
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
    }),
    createdAt: t.String(),
    updatedAt: t.String(),
  })

  export const listReportsResponse = t.Object({
    data: t.Array(scholarshipReport),
    page: t.Number(),
    pageSize: t.Number(),
    total: t.Number(),
    pageCount: t.Number(),
  })

  export const updateReportReason = t.Object({
    reason: t.String({
      minLength: 1,
      pattern: '^(?!\\s*$).+',
      description: 'Nombre del motivo del reporte',
    }),
    reasonDetail: t.String({
      minLength: 3,
      pattern: '^(?!\\s*$).+',
      description: 'Detalle del motivo del reporte',
    }),
  })

  export type ListReportsQuery = typeof listReportsQuery.static
  export type UpdateReportReason = typeof updateReportReason.static
}
