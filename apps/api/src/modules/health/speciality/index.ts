import betterAuth from '@api/modules/auth'
import Elysia, { t } from 'elysia'
import { SpecialityModel } from './model'
import { createSpeciality, getSpecialities } from './service'

const speciality = new Elysia({
  name: 'speciality',
  prefix: '/speciality',
})
  .use(betterAuth)
  .get('', getSpecialities, {
    auth: true,
    response: {
      200: SpecialityModel.getSpecialities,
      401: t.Literal('Unauthorized'),
    },
  })
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

export default speciality
