import Elysia from 'elysia'
import { activity } from './activity'

export const health = new Elysia({
  name: 'health',
  prefix: '/health',
  tags: ['Health'],
}).use(activity)
