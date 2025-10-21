import betterAuth from '@api/modules/auth'
import Elysia, { status, t } from 'elysia'
import { SpecialityModel } from './model'
import {
  createSpeciality,
  findDuplicateSpeciality,
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
      if (!res) throw status(404, 'No se encontró la especialidad')
      return res
    },
    {
      auth: true,
      params: SpecialityModel.getSingleSpecialityQuery,
      response: {
        200: SpecialityModel.getSingleSpecialityResponse,
        404: t.String(),
      },
    },
  )
  .post(
    '',
    async ({ body }) => {
      const duplicate = await findDuplicateSpeciality(body.name)
      if (duplicate)
        throw status(400, `La especialidad "${duplicate.name}" ya existe`)

      return createSpeciality(body)
    },
    {
      auth: true,
      body: SpecialityModel.createSpeciality,
      response: {
        200: t.Number({
          description: 'ID de la especialidad creada',
        }),
        400: t.String(),
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body }) => {
      const id = Number(params.id)

      const existing = await getSingleSpeciality(id)
      if (!existing) throw status(404, 'No se encontró la especialidad')

      const duplicate = await findDuplicateSpeciality(body.name, id)
      if (duplicate)
        throw status(400, `La especialidad "${duplicate.name}" ya existe`)

      const updated = await updateSpeciality(id, body)
      return updated
    },
    {
      auth: true,
      params: SpecialityModel.getSingleSpecialityQuery,
      body: SpecialityModel.updateSpeciality,
      response: {
        200: SpecialityModel.getSingleSpecialityResponse,
        400: t.String(),
        404: t.String(),
      },
    },
  )

export default speciality
