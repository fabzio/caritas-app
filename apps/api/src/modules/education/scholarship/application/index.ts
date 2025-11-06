import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { Application } from './model'
import {
  acceptApplications,
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
    ({ body, session, user }) => {
      return acceptApplications({
        ...body,
        userId: session?.userId ?? user?.id ?? '',
      })
    },
    {
      auth: true,
      body: Application.acceptApplicationsBody,
      response: {
        200: t.Array(t.Number({ description: 'IDs of accepted applications' })),
        401: t.Literal('Unauthorized'),
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
  .post('', ({ body }) => createScholarshipApplication(body), {
    auth: true,
    body: Application.createScholarshipApplicationBody,
    response: {
      200: t.Number({
        description: 'ID of the created scholarship application',
      }),
      401: t.Literal('Unauthorized'),
    },
  })

export default application
