import Elysia from 'elysia'
import region from './regions'
import setup from './setup'

const authModule = new Elysia({
  name: 'auth',
  prefix: '/auth',
  tags: ['Auth'],
})
  .use(setup)
  .use(region)

export default authModule
