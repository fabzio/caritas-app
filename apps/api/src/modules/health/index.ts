import Elysia from 'elysia'
import organization from '../admin/organization'
import activity from './activity'

const healthModule = new Elysia({
  name: 'health',
  prefix: '/health',
  tags: ['Health'],
})
  .use(activity)
  .use(organization)

export default healthModule
