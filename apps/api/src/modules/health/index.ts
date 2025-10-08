import Elysia from 'elysia'
import activityModule from './activity'

const healthModule = new Elysia({
  name: 'health',
  prefix: '/health',
  tags: ['Health'],
}).use(activityModule)

export default healthModule
