import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
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
    ({ body, session, user }) => {
      const reviewedBy = session?.userId ?? user?.id ?? ''
      return createScholarshipRecipient({
        ...body,
        reviewedBy,
      })
    },
    {
      auth: true,
      body: ScholarshipRecipientModel.createScholarshipRecipient,
      response: {
        200: t.Number({
          description: 'ID of the created scholarship recipient',
        }),
        401: t.Literal('Unauthorized'),
      },
    },
  )

export default scholarshipRecipients
