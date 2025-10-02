import Elysia, { t } from 'elysia'
import { UserModel } from './model'
import { createUser, getUsers, updateUser } from './service'

const users = new Elysia({ prefix: '/users' })
  .get('', ({ query }) => getUsers(query), {
    query: UserModel.listUsersQuery,
    response: {
      200: UserModel.getUsersResponse,
    },
  })
  .post('', ({ body }) => createUser(body), {
    body: UserModel.createUserBody,
    response: {
      200: UserModel.createUserResponse,
    },
  })
  .put('', ({ body, query }) => updateUser(body, query), {
    body: UserModel.createUserBody,
    query: t.Object({ id: t.String() }),
    response: {
      200: t.String(),
    },
  })

export default users
