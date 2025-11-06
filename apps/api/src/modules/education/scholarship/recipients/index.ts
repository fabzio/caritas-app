import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { ScholarshipRecipientModel } from './model'
import {
  createScholarshipRecipient,
  getRecipients,
  getSelectNamesResponse,
} from './service'

const scholarshipRecipients = new Elysia({
  name: 'recipients',
  prefix: '/recipients',
})
  .use(betterAuth)
  .get('', ({ query }) => getRecipients(query), {
    query: ScholarshipRecipientModel.listRecipientsQuery,
    response: {
      200: ScholarshipRecipientModel.getlistScholarshipRecipientsResponse,
    },
  })
  .get('/selectNames', () => getSelectNamesResponse(), {
    response: {
      200: ScholarshipRecipientModel.getSelectNamesResponse,
    },
  })
  .post(
    '',
    async ({ body, session, user }) => {
      const reviewedBy = session?.userId ?? user?.id ?? ''
      const result = await createScholarshipRecipient({
        ...body,
        reviewedBy,
      })
      if (result.error === 'Beneficiario no encontrado')
        throw status(404, result.error)
      if (result.error === 'Beca no encontrada') throw status(404, result.error)
      if (result.error === 'El beneficiario ya ha sido aceptado para esta beca')
        throw status(409, result.error)
      if (result.error) throw status(400, result.error)
      if (result.id == null) throw status(500, 'Fallo al crear un becado')
      return result.id
    },
    {
      auth: true,
      body: ScholarshipRecipientModel.createScholarshipRecipient,
      response: {
        200: t.Number({
          description: 'ID of the created scholarship recipient',
        }),
        400: t.String(),
        401: t.Literal('Unauthorized'),
      },
    },
  )

export default scholarshipRecipients
