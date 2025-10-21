import Elysia from 'elysia'

import organization from './organization'
import organizationMajor from './organizationMajor'
import scholarship from './scholarship'
import scholarshipApplication from './scholarship-application'
import scholarshipRecipient from './scholarshipRecipient'

const educationModule = new Elysia({
  name: 'education',
  prefix: '/education',
  tags: ['Education'],
})
  .use(organizationMajor)
  .use(organization)
  .use(scholarship)
  .use(scholarshipRecipient)
  .use(scholarshipApplication)

export default educationModule
