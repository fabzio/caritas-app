import Elysia from 'elysia'
import region from './regions'
import users from './users'

const common = new Elysia({
  name: 'common',
})
  .use(region)
  .use(users)

export default common
