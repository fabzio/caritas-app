import Elysia, { t } from 'elysia'
import betterAuth from '@/modules/auth'
import { ScholarshipModel } from './model'
import { createScholarship, getScholarships } from './service'

const scholarship = new Elysia({
  name: 'scholarship',
  prefix: '/scholarship',
})
  .use(betterAuth)
  .get('', getScholarships, {
    // listado de becas
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
