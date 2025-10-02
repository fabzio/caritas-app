import Elysia from 'elysia'
import scholarshipRecipient from './scholarshipRecipient'

const educationModule = new Elysia({
  name: 'education',
  prefix: '/education',
  tags: ['Education'],
}).use(scholarshipRecipient)

export default educationModule
