import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { ReportModel } from './model'
import { createScholarshipReport } from './service'

const scholarshipReport = new Elysia({
  name: 'report',
  prefix: '/report',
})
  .use(betterAuth)
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
export default scholarshipReport
