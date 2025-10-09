import Elysia, { t } from 'elysia'
import betterAuth from '@/modules/auth/middleware'
import { ScholarshipRecipientModel } from './model'
import { createScholarshipRecipient, getRecipients } from './service'

const scholarshipRecipients = new Elysia({
  prefix: '/scholarshipRecipients',
})
  .use(betterAuth)
  .get('', ({ query }) => getRecipients(query), {
    query: ScholarshipRecipientModel.listRecipientsQuery,
    response: {
      200: ScholarshipRecipientModel.getlistScholarshipRecipientsResponse,
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
