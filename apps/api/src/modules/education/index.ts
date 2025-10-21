import Elysia from 'elysia'
import scholarshipApplication from './application'
import fair from './fair'
import organization from './organization'
import organizationMajor from './organizationMajor'
import scholarship from './scholarship'
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
  .use(fair)
  .use(scholarshipApplication)

export default educationModule
