import Elysia from 'elysia'
import { RegionModel } from './model'
import { getRegions } from './service'

const region = new Elysia({
  prefix: '/regions',
}).get('', getRegions, {
  response: {
    200: RegionModel.getRegions,
  },
})
export default region
