import Elysia from 'elysia'
import organization from '../admin/organization'
import activityModule from './activity'
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

export default healthModule
