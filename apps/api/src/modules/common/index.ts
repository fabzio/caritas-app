import Elysia from 'elysia'
import region from './regions'
import user from './users'

const common = new Elysia({
  name: 'common',
})
  .use(region)
  .use(user)

export default common
