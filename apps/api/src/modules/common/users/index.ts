// import betterAuth from '@api/modules/auth/middleware'
import Elysia from 'elysia'
import { UserModel } from './model'
import { getSingleUser, getUsers } from './service'

const user = new Elysia({
  prefix: '/users',
})
  // .use(betterAuth)
  .get('/', ({ query }) => getUsers(query), {
    query: UserModel.listUsersQuery,
    response: {
      200: UserModel.getUsersResponse,
    },
  })
  .get('/:id', getSingleUser, {
    auth: true,
    params: UserModel.getSingleUserQuery,
    response: {
      200: UserModel.getSingleUserResponse,
    },
  })
export default user
