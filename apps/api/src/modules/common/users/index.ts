import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { UserModel } from './model'
import { getUserDetail } from './service'

const users = new Elysia({
  name: 'common.users',
  prefix: '/users',
})
  .use(betterAuth)
  .get(
    '/:id',
    async ({ params }) => {
      const user = await getUserDetail(params.id)
      if (!user) throw status(404, 'User not found')
      return user
    },
    {
      auth: true,
      params: UserModel.getUserParams,
      response: {
        200: UserModel.getUserResponse,
        401: t.Literal('Unauthorized'),
        404: t.Literal('User not found'),
      },
    },
  )

export default users
