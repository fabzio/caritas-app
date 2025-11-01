import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import application from './application'
import { ScholarshipModel } from './model'
import scholarshipRecipients from './recipients'
import {
  createScholarship,
  deleteScholarships,
  findDuplicateScholarship,
  getScholarships,
  getSingleScholarship,
  PatchScholarship,
} from './service'

const scholarship = new Elysia({
  name: 'scholarship',
  prefix: '/scholarship',
})
  .use(betterAuth)
  .use(application)
  .use(scholarshipRecipients)
  .get('', ({ query }) => getScholarships(query), {
    auth: true,
    query: t.Object({
      name: t.Optional(t.String()),
      page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
      pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 20, default: 10 })),
    }),
    response: {
      200: ScholarshipModel.paginated,
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
        404: t.Literal('Scholarship not found'),
      },
    },
  )
  .post(
    '',
    async ({ body }) => {
      const duplicate = await findDuplicateScholarship(body.name)
      if (duplicate) throw status(400, `La beca "${duplicate.name}" ya existe`)
      return createScholarship(body)
    },
    {
      auth: true,
      body: ScholarshipModel.createScholarship,
      response: {
        200: t.Number({
          description: 'ID of the created scholarship',
        }),
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body }) => {
      const id = Number(params.id)
      const existing = await getSingleScholarship({ id })
      if (!existing) throw status(404, 'No se encontró la especialidad')
      if (body.name) {
        const duplicate = await findDuplicateScholarship(body.name, id)
        if (duplicate)
          throw status(400, `La especialidad "${duplicate.name}" ya existe`)
      }
      return PatchScholarship(Number(params.id), body)
    },
    {
      auth: true,
      params: ScholarshipModel.getSingleScholarshipQuery,
      body: ScholarshipModel.updateScholarship,
      response: {
        200: t.Number({
          description: 'Number of updated rows',
        }),
        404: t.Literal('Scholarship not found'),
      },
    },
  )
  .delete(
    '',
    async ({ body }) => {
      const { ids } = body
      if (!ids.length)
        throw status(400, 'No hay ningún ID de beca para eliminar')
      const deleted = await deleteScholarships(ids)
      return deleted
    },
    {
      auth: true,
      body: ScholarshipModel.deleteScholarships,
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.String(),
      },
    },
  )

export default scholarship
