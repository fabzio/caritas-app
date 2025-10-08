import Elysia from 'elysia'
import user from './user'

const adminModule = new Elysia({
  name: 'admin',
  prefix: '/admin',
  tags: ['Admin'],
}).use(user)

export default adminModule
