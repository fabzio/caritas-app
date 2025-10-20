import Elysia from 'elysia'
import access from './access'
import { welcome } from './welcome'

const authModule = new Elysia({
  name: 'auth',
  prefix: '/auth',
  tags: ['Auth'],
})
  .use(welcome)
  .use(access)
export default authModule
