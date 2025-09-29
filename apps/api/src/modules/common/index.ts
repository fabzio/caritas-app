import Elysia from 'elysia'
import region from './regions'

const common = new Elysia({
  name: 'common',
}).use(region)

export default common
