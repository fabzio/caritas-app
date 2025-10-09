import betterAuth from '@api/modules/auth/middleware'
import Elysia, { t } from 'elysia'
import { ScholarshipModel } from './model'
import { createScholarship, getScholarships } from './service'

const scholarship = new Elysia({
  name: 'scholarship',
  prefix: '/scholarship',
})
  .use(betterAuth)
  .get('', getScholarships, {
    auth: true,
    response: {
      200: ScholarshipModel.getScholarship,
      401: t.Literal('Unauthorized'),
    },
  })
  .post('', ({ body }) => createScholarship(body), {
    auth: true,
    body: ScholarshipModel.createScholarship,
    response: {
      200: t.Number({
        description: 'ID of the created scholarship',
      }),
      401: t.Literal('Unauthorized'),
    },
  })

export default scholarship
