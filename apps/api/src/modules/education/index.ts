import Elysia from 'elysia'

import beneficiary from './beneficiary'
import fair from './fair'
import organization from './organization'
import organizationMajor from './organizationMajor'
import scholarship from './scholarship'

const educationModule = new Elysia({
  name: 'education',
  prefix: '/education',
  tags: ['Education'],
})
  .use(organizationMajor)
  .use(organization)
  .use(scholarship)
  .use(fair)
  .use(beneficiary)

export default educationModule
