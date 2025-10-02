import Elysia, { t } from 'elysia'
import { ScholarshipApplicationModel } from './model'
import {
  acceptScholarshipApplication,
  createScholarshipApplication,
  getScholarshipApplications,
} from './service'

const scholarshipApplication = new Elysia({
  name: 'scholarship-application',
  prefix: '/scholarship-application',
})
  .get('', getScholarshipApplications, {
    auth: true,
    response: {
      200: ScholarshipApplicationModel.getScholarshipApplication,
      401: t.Literal('Unauthorized'),
    },
  })
  .post('', ({ body }) => createScholarshipApplication(body), {
    auth: true,
    body: ScholarshipApplicationModel.createScholarshipApplication,
    response: {
      200: t.Number({
        description: 'ID of the created scholarship application',
      }),
      401: t.Literal('Unauthorized'),
    },
  })
  .patch(
    '/:id/accept',
    (context) => {
      type AcceptContext = {
        params: { id: string }
        body: { comments?: string }
        session?: { userId?: string }
        user?: { id?: string }
      }
      const ctx = context as unknown as AcceptContext
      const args: ScholarshipApplicationModel.AcceptScholarshipApplication = {
        id: Number(ctx.params.id),
        userId: ctx.session?.userId ?? ctx.user?.id ?? '',
        comments: ctx.body?.comments,
      }
      return acceptScholarshipApplication(args)
    },
    {
      auth: true,
      response: {
        200: t.Number({
          description: 'ID of the accepted scholarship application',
        }),
        401: t.Literal('Unauthorized'),
      },
    },
  )

export default scholarshipApplication
