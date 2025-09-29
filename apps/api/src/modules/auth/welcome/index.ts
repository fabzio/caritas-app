import Elysia from 'elysia'
import { WelcomeModel } from './model'
import { addAditionalInfo } from './service'

export const welcome = new Elysia({
  name: 'welcome',
  prefix: '/welcome',
}).post('/user', async ({ body }) => await addAditionalInfo(body), {
  body: WelcomeModel.userWelcome,
})
