import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { Application } from './model'
import { createScholarshipApplication } from './service'

const application = new Elysia({
  name: 'application',
  prefix: '/application',
})
  .use(betterAuth)
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
