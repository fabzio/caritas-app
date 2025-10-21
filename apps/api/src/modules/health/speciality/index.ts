import betterAuth from '@api/modules/auth'
import Elysia, { status, t } from 'elysia'
import { SpecialityModel } from './model'
import {
  createSpeciality,
  getSingleSpeciality,
  getSpecialities,
  updateSpeciality,
} from './service'

const speciality = new Elysia({
  name: 'speciality',
  prefix: '/speciality',
})
  .use(betterAuth)
  .get('/', ({ query }) => getSpecialities(query), {
    auth: true,
    query: SpecialityModel.listSpecialitiesQuery,
    response: {
      200: SpecialityModel.getSpecialitiesResponse,
    },
  })
  .get(
    '/:id',
    async ({ params }) => {
      const res = await getSingleSpeciality(Number(params.id))
      if (!res) throw status(404, 'Speciality not found')
      return res
    },
    {
      auth: true,
      params: SpecialityModel.getSingleSpecialityQuery,
      response: {
        200: SpecialityModel.getSingleSpecialityResponse,
        404: t.Literal('Speciality not found'),
      },
    },
  )
  .post('', ({ body }) => createSpeciality(body), {
    auth: true,
    body: SpecialityModel.createSpeciality,
    response: {
      200: t.Number({
        description: 'ID of the created speciality',
      }),
      401: t.Literal('Unauthorized'),
    },
  })
  .patch(
    '/:id',
    async ({ params, body }) => {
      const updated = await updateSpeciality(Number(params.id), body)
      if (!updated) throw status(404, 'Speciality not found')
      return updated
    },
    {
      auth: true,
      params: SpecialityModel.getSingleSpecialityQuery,
      body: SpecialityModel.updateSpeciality,
      response: {
        200: SpecialityModel.getSingleSpecialityResponse,
        404: t.Literal('Speciality not found'),
      },
    },
  )

export default speciality
