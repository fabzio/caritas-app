import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { Application } from './model'
import {
  acceptApplications,
  checkApplicationStatus,
  createScholarshipApplication,
  getApplicantsByScholarship,
  rejectScholarshipRecipients,
} from './service'

const application = new Elysia({
  name: 'application',
  prefix: '/application',
})
  .use(betterAuth)
  .get(
    '/:scholarshipId',
    ({ params }) =>
      getApplicantsByScholarship({ scholarshipId: params.scholarshipId }),
    {
      auth: true,
      params: t.Object({ scholarshipId: t.String() }),
      response: {
        200: Application.getApplicantsByScholarshipResponse,
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .patch(
    '/accept',
    async ({ body, session, user }) => {
      try {
        return await acceptApplications({
          ...body,
          userId: session?.userId ?? user?.id ?? '',
        })
      } catch (error) {
        if (error instanceof Error) {
          const msg = error.message.toLowerCase()
          if (msg.includes('no se encontró la beca'))
            throw status(404, error.message)
          if (msg.includes('no se encontraron las aplicaciones'))
            throw status(404, error.message)
          if (msg.includes('ya ha postulado') || msg.includes('vacante'))
            throw status(409, error.message)
          if (
            msg.includes('obligatorio') ||
            msg.includes('seleccionar') ||
            msg.includes('inválido')
          )
            throw status(400, error.message)
          throw status(500, 'Error interno al aceptar aplicaciones')
        }
        throw status(500, 'Error inesperado al aceptar aplicaciones')
      }
    },
    {
      auth: true,
      body: Application.acceptApplicationsBody,
      response: {
        200: t.Array(t.Number({ description: 'IDs of accepted applications' })),
        400: t.String({ description: 'Bad request error message' }),
        404: t.String({ description: 'Not found error message' }),
        409: t.String({ description: 'Conflict error message' }),
        401: t.Literal('Unauthorized'),
        500: t.String(),
      },
    },
  )
  .patch(
    '/reject',
    ({ body, session, user }) =>
      rejectScholarshipRecipients({
        ...body,
        userId: session?.userId ?? user?.id ?? '',
      }),
    {
      auth: true,
      body: Application.rejectRecipientsBody,
      response: {
        200: t.Array(
          t.Number({ description: 'IDs of rejected scholarship recipients' }),
        ),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .post(
    '',
    async ({ body }) => {
      try {
        return await createScholarshipApplication(body)
      } catch (error) {
        if (error instanceof Error) {
          const msg = error.message.toLowerCase()
          if (msg.includes('ya ha postulado')) throw status(409, error.message)
          if (msg.includes('no se encontró')) throw status(404, error.message)
          throw status(500, 'Error interno al crear la aplicación')
        }
        throw status(500, 'Error inesperado al crear la aplicación')
      }
    },
    {
      auth: true,
      body: Application.createScholarshipApplicationBody,
      response: {
        200: t.Number({
          description: 'ID of the created scholarship application',
        }),
        401: t.Literal('Unauthorized'),
        404: t.String({ description: 'Not found error message' }),
        409: t.String({ description: 'Conflict error message' }),
        500: t.String({ description: 'Internal server error message' }),
      },
    },
  )
  .get(
    '/check/:scholarshipId',
    ({ params, session, user }) =>
      checkApplicationStatus({
        scholarshipId: Number(params.scholarshipId),
        userId: session?.userId ?? user?.id ?? '',
      }),
    {
      auth: true,
      params: t.Object({ scholarshipId: t.String() }),
      response: {
        200: Application.checkApplicationStatusResponse,
        401: t.Literal('Unauthorized'),
      },
    },
  )

export default application
