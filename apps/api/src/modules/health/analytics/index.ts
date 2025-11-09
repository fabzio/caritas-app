import Elysia from 'elysia'
import { getAttentions } from './service'

export const analytics = new Elysia({
  prefix: '/analytics',
}).get('attentions', getAttentions)
