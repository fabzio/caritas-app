import Elysia from 'elysia'
import organization from '../admin/organization'
import activityModule from './activity'
import { analytics } from './analytics'
import beneficiary from './beneficiary'
import speciality from './speciality'

const healthModule = new Elysia({
  name: 'health',
  prefix: '/health',
  tags: ['Health'],
})

  .use(activityModule)
  .use(organization)
  .use(speciality)
  .use(beneficiary)
  .use(analytics)

export default healthModule
