import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { SpecialityModel } from './model'
import {
  checkSpecialityHaveActiveActivities,
  createSpeciality,
  deleteSpecialities,
  findDuplicateSpeciality,
  getSingleSpeciality,
  getSpecialities,
  hasActivitiesAssociated,
  updateSpeciality,
} from './service'

const speciality = new Elysia({
  name: 'speciality',
  prefix: '/speciality',
})
  .use(betterAuth)
  .get('/', ({ query }) => getSpecialities(query), {
    auth: true,
    query: SpecialityModel.getSpecialitiesQuery,
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
  .delete(
    '/',
    async ({ body }) => {
      const { ids } = body

      if (!ids.length) {
        throw status(400, 'No hay ningún ID de especialidad para eliminar')
      }

      // const idsWithActivities = []
      // const specialityNames = []

      // for (const id of ids) {
      //   const hasActivities = await hasActivitiesAssociated(id)
      //   if (hasActivities) {
      //     idsWithActivities.push(id)
      //     const speciality = await getSingleSpeciality(id)
      //     if (speciality) {
      //       specialityNames.push(speciality.name)
      //     }
      //   }
      // }

      // if (idsWithActivities.length > 0) {
      //   throw status(
      //     400,
      //     `Las siguientes especialidades no se pueden eliminar por tener actividades asociadas: ${specialityNames.join(', ')}`,
      //   )
      // }

      const specialitiesWithActivities =
        await checkSpecialityHaveActiveActivities(ids)

      if (specialitiesWithActivities.length > 0) {
        console.log('index:', specialitiesWithActivities)
        throw status(409, {
          specialitiesWithActivities,
        })
      }

      const deleted = await deleteSpecialities(ids)
      return deleted
    },
    {
      auth: true,
      body: SpecialityModel.deleteSpecialities,
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.String(),
        409: SpecialityModel.deleteSpecialitiesWithActivities,
      },
    },
  )

export default speciality
