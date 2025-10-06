import betterAuth from '@api/modules/auth/middleware'
import Elysia from 'elysia'
import { UserModel } from './model'
import { getSingleUser } from './service'

const user = new Elysia({
  prefix: '/users',
})
  .use(betterAuth)
  .get('', getSingleUser, {
    auth: true,
    query: UserModel.getSingleUserQuery,
    response: {
      200: UserModel.getSingleUserResponse,
    },
  })
export default user
