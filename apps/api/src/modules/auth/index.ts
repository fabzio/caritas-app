import Elysia from 'elysia'
import setup from './setup'
import { welcome } from './welcome'

const authModule = new Elysia({
  name: 'auth',
  prefix: '/auth',
  tags: ['Auth'],
})
  .use(setup)
  .use(welcome)

export default authModule
