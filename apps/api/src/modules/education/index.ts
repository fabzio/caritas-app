import Elysia from 'elysia'
import organization from './organization'

const educationModule = new Elysia({
  name: 'education',
  prefix: '/education',
  tags: ['Education'],
}).use(organization)

export default educationModule
