import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { ScholarshipApplicationModel } from './model'
import {
  acceptAllScholarshipApplications,
  acceptScholarshipApplication,
  acceptScholarshipApplicationsBatch,
  createScholarshipApplication,
  getApplicantsByScholarshipId,
  getScholarshipApplications,
} from './service'

const scholarshipApplication = new Elysia({
  name: 'scholarship-application',
  prefix: '/application',
})
  .use(betterAuth)
  .get('', getScholarshipApplications, {
    auth: true,
    response: {
      200: ScholarshipApplicationModel.getScholarshipApplication,
      401: t.Literal('Unauthorized'),
    },
  })
  .get(
    '/:scholarshipId',
    ({ params }) =>
      getApplicantsByScholarshipId({ scholarshipId: params.scholarshipId }),
    {
      auth: true,
      params: t.Object({ scholarshipId: t.String() }),
      response: {
        200: ScholarshipApplicationModel.getApplicantsByScholarshipId,
        401: t.Literal('Unauthorized'),
      },
    },
  )
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
    '/:scholarshipId/accept',
    (ctx) => {
      const args: ScholarshipApplicationModel.AcceptScholarshipApplication = {
        scholarship_id: Number(ctx.params.scholarship_id),
        userId: ctx.session?.userId ?? ctx.user?.id ?? '',
        comments: ctx.body?.comments,
      }
      return acceptScholarshipApplication(args)
    },
    {
      auth: true,
      params: t.Object({ scholarshipId: t.String() }),
      response: {
        200: t.Number({
          description: 'ID of the accepted scholarship application',
        }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .patch(
    '/accept-batch',
    (ctx) => {
      const args = {
        ids: ctx.body.ids,
        userId: ctx.session?.userId ?? ctx.user?.id ?? '',
        comments: ctx.body.comments,
      }
      return acceptScholarshipApplicationsBatch(args)
    },
    {
      auth: true,
      body: ScholarshipApplicationModel.acceptApplicationsBatch,
      response: {
        200: t.Array(t.Number({ description: 'IDs of accepted applications' })),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .patch(
    '/:scholarshipId/accept-all',
    ({ body: { comments, scholarshipId, userId } }) => {
      return acceptAllScholarshipApplications({
        scholarshipId,
        userId,
        comments,
      })
    },
    {
      auth: true,
      params: t.Object({ scholarshipId: t.String() }),
      body: ScholarshipApplicationModel.acceptAllByScholarship,
      response: {
        200: t.Array(t.Number({ description: 'IDs of accepted applications' })),
        401: t.Literal('Unauthorized'),
      },
    },
  )

export default scholarshipApplication
