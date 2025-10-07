import Elysia from 'elysia'
import organization from './organization'
import scholarship from './scholarship'
import scholarshipApplication from './scholarship-application'
import scholarshipRecipient from './scholarshipRecipient'

const educationModule = new Elysia({
  name: 'education',
  prefix: '/education',
  tags: ['Education'],
})
  .use(organization)
  .use(scholarship)
  .use(scholarshipApplication)
  .use(scholarshipRecipient)

export default educationModule
