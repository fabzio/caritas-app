import Elysia from 'elysia'
import { UserModel } from './model'
import { getUsers } from './service'

const users = new Elysia({ prefix: '/users' }).get(
  '',
  ({ query }) => getUsers(query),
  {
    query: UserModel.listUsersQuery,
    response: {
      200: UserModel.getUsersResponse,
    },
  },
)

export default users
