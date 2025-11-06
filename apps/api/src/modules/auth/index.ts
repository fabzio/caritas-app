import Elysia from 'elysia'
import access from './access'
import { info } from './info'

const authModule = new Elysia({
  name: 'auth',
  prefix: '/auth',
  tags: ['Auth'],
})
  .use(info)
  .use(access)
export default authModule
