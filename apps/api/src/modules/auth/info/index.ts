import Elysia from 'elysia'
import { patient } from './patient'
import { student } from './student'

export const info = new Elysia({
  name: 'info',
  prefix: '/info',
})
  .use(student)
  .use(patient)
