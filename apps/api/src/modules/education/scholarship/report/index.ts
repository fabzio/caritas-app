import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { ReportModel } from './model'
import {
  createScholarshipReport,
  getScholarshipReports,
  updateScholarshipReportReason,
} from './service'

const scholarshipReport = new Elysia({
  name: 'report',
  prefix: '/report',
})
  .get('', ({ query }) => getScholarshipReports(query), {
    auth: true,
    query: ReportModel.listReportsQuery,
    response: {
      200: ReportModel.listReportsResponse,
      401: t.Literal('Unauthorized'),
    },
  })
  .post(
    '',
    async ({ body, request }) => {
      try {
        if (!body.reportedBy) {
          throw status(400, 'reportedBy es obligatorio')
        }
        const id = await createScholarshipReport(body, request.headers)
        return id
      } catch (error) {
        console.error('Error creando reporte:', error)
        throw status(400, 'Error creando el reporte')
      }
    },
    {
      auth: true,
      body: ReportModel.createScholarshipReport,
      response: {
        200: t.Number({
          description: 'ID of the created scholarship report',
        }),
        400: t.String(),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body, user }) => {
      try {
        if (!user?.id) {
          throw status(401, 'Usuario no autenticado')
        }
        return await updateScholarshipReportReason(params.id, body, user.id)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Error actualizando el motivo del reporte'
        throw status(400, message)
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.Numeric(),
      }),
      body: ReportModel.updateReportReason,
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.String(),
        401: t.String(),
      },
    },
  )
export default scholarshipReport
