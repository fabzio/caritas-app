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
    (context) => {
      type CreateContext = {
        body: { scholarshipId: number; userId: string; comments?: string }
        session?: { userId?: string }
        user?: { id?: string }
      }
      const ctx = context as unknown as CreateContext
      const reviewedBy = ctx.session?.userId ?? ctx.user?.id ?? ''
      return createScholarshipRecipient({
        scholarshipId: ctx.body.scholarshipId,
        userId: ctx.body.userId,
        reviewedBy,
        comments: ctx.body.comments,
      })
    },
    {
      auth: true,
      body: t.Object({
        scholarshipId: t.Number(),
        userId: t.String(),
        comments: t.Optional(t.String()),
      }),
      response: {
        200: t.Number({
          description: 'ID of the created scholarship recipient',
        }),
        401: t.Literal('Unauthorized'),
      },
    },
  )

export default scholarshipRecipients
