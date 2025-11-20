import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { UserModel } from './model'
import { getUserDetail, getUserOrganizations } from './service'

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
  .get(
    '/:id/organizations',
    async ({ params }) => {
      const user = await getUserDetail(params.id)
      if (!user) throw status(404, 'User not found')

      return getUserOrganizations(params.id)
    },
    {
      auth: true,
      params: UserModel.getUserParams,
      response: {
        200: UserModel.getUserOrganizationsResponse,
        401: t.Literal('Unauthorized'),
        403: t.Literal('Forbidden'),
        404: t.Literal('User not found'),
      },
    },
  )

export default users
