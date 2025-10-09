import Elysia from 'elysia'
import organization from './organization'
import user from './user'

const adminModule = new Elysia({
  name: 'admin',
  prefix: '/admin',
  tags: ['Admin'],
})
  .use(user)
  .use(organization)

export default adminModule
