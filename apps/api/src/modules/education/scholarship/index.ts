import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { ScholarshipModel } from './model'
import {
  createScholarship,
  getScholarships,
  getSingleScholarship,
} from './service'

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
  .get(
    '/:id',
    async ({ params }) => {
      const res = await getSingleScholarship({ id: Number(params.id) })
      if (!res) throw status(404, 'Organization not found')
      return res
    },
    {
      auth: true,
      params: ScholarshipModel.getSingleScholarshipQuery,
      response: {
        200: ScholarshipModel.getSingleScholarshipResponse,
        404: t.Literal('Organization not found'),
      },
    },
  )

export default scholarship
