import betterAuth from '@api/modules/auth'
import Elysia, { t } from 'elysia'
import { ScholarshipModel } from './model'
import { createScholarship, getScholarships } from './service'

const scholarship = new Elysia({
  name: 'scholarship',
  prefix: '/scholarship',
})
  .use(betterAuth)
  .get('', ({ query }) => getScholarships(query), {
    // listado de becas con filtrado por nombre
    auth: true,
    query: t.Object({
      name: t.Optional(t.String()),
      page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
      pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 20, default: 10 })),
    }),
    response: {
      200: ScholarshipModel.paginated, // con el esquema de paginación
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
