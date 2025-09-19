import Elysia from 'elysia'
import activity from './activity'

const healthModule = new Elysia({
  name: 'health',
  prefix: '/health',
  tags: ['Health'],
}).use(activity)

export default healthModule
