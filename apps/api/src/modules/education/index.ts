import Elysia from 'elysia'

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

export default educationModule
