import valkey from '@api/db/valkey'
import { auth } from '@api/lib/auth'
import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { UserModel } from './model'
import { getUserDetail, getUserOrganizations, updateUser } from './service'

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
  .patch(
    '/:id',
    async ({ params, body, request: { headers } }) => {
      try {
        const user = await updateUser(params.id, body)
        if (!user) throw status(404, 'User not found')
        const { sessions } = await auth.api.listUserSessions({
          body: {
            userId: params.id,
          },
          headers,
        })
        await Promise.allSettled(
          sessions.map(async (session) => {
            const data = JSON.parse(
              (await valkey.get(session.token)) as string,
            ) as typeof auth.$Infer.Session
            await valkey.set(
              session.token,
              JSON.stringify({
                ...data,
                user: {
                  ...data.user,
                  name: user.name,
                  surname: user.surname,
                  phone: user.phone,
                },
              }),
            )
          }),
        )

        return user
      } catch (e) {
        if (
          e instanceof Error &&
          e.message === 'Número de teléfono ya en uso'
        ) {
          throw status(409, 'Número de teléfono ya en uso')
        }
        throw e
      }
    },
    {
      auth: true,
      params: UserModel.getUserParams,
      body: UserModel.updateUserBody,
      response: {
        200: t.Object({
          name: t.String(),
          surname: t.String(),
          phone: t.String(),
        }),
        401: t.Literal('Unauthorized'),
        404: t.Literal('User not found'),
        409: t.Literal('Phone number already in use'),
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
