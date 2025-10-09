import Elysia from 'elysia'
import organization from '../admin/organization'
import activityModule from './activity'
import speciality from './speciality'

const healthModule = new Elysia({
  name: 'health',
  prefix: '/health',
  tags: ['Health'],
})

  .use(activityModule)
  .use(organization)
  .use(speciality)

export default healthModule
