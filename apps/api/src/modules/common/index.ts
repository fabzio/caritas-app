import Elysia from 'elysia'
import organizations from './organizations'
import region from './regions'
import users from './users'

const common = new Elysia({
  name: 'common',
})
  .use(region)
  .use(organizations)
  .use(users)

export default common
