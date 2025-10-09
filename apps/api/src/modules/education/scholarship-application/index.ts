import Elysia, { t } from 'elysia'
import betterAuth from '@/modules/auth/middleware'
import { ScholarshipApplicationModel } from './model'
import {
  acceptAllScholarshipApplications,
  acceptScholarshipApplicationsBatch,
  createScholarshipApplication,
  getApplicantsByScholarshipId,
  getScholarshipApplications,
} from './service'

const scholarshipApplication = new Elysia({
  name: 'scholarship-application',
  prefix: '/scholarship-application',
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
    '/:scholarship_id',
    ({ params }) =>
      getApplicantsByScholarshipId({ scholarship_id: params.scholarship_id }),
    {
      auth: true,
      params: t.Object({ scholarship_id: t.String() }),
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
    '/accept-batch',
    ({ body, session, user }) => {
      const args = {
        ids: body.ids,
        userId: session?.userId ?? user?.id ?? '',
        comments: body.comments,
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
    '/:scholarship_id/accept-all',
    ({ params, body, session, user }) => {
      const args = {
        scholarshipId: Number(params.scholarship_id),
        userId: session?.userId ?? user?.id ?? '',
        comments: body.comments,
      }
      return acceptAllScholarshipApplications(args)
    },
    {
      auth: true,
      params: t.Object({ scholarship_id: t.String() }),
      body: ScholarshipApplicationModel.acceptAllByScholarship,
      response: {
        200: t.Array(t.Number({ description: 'IDs of accepted applications' })),
        401: t.Literal('Unauthorized'),
      },
    },
  )

export default scholarshipApplication
