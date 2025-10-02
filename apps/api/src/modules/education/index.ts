import Elysia from 'elysia'
import organization from './organization'
import scholarship from './scholarship'
import scholarshipApplication from './scholarship-application'

const educationModule = new Elysia({
  name: 'education',
  prefix: '/education',
  tags: ['Education'],
})
  .use(organization)
  .use(scholarship)
  .use(scholarshipApplication)

export default educationModule
