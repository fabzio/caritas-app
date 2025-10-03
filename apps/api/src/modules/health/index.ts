import Elysia from 'elysia'
import activity from './activity'
import healthOrganization from './organization'

const healthModule = new Elysia({
  name: 'health',
  prefix: '/health',
  tags: ['Health'],
})
  .use(activity)
  .use(healthOrganization)

export default healthModule
