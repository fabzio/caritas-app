import Elysia from 'elysia'
import scholarshipApplication from './scholarship-application'

const educationModule = new Elysia({
  name: 'education',
  prefix: '/education',
  tags: ['Education'],
}).use(scholarshipApplication)

export default educationModule
