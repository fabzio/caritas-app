import Elysia from 'elysia'
import activity from './activity'
import speciality from './speciality'

const healthModule = new Elysia({
  name: 'health',
  prefix: '/health',
  tags: ['Health'],
})
  .use(activity)
  .use(speciality)

export default healthModule
