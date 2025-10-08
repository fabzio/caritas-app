import { auth } from '@api/lib/auth'
import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { UserModel } from './model'
import {
  getBeneficiaries,
  getSingleUser,
  getTeamName,
  getUsers,
} from './service'

const user = new Elysia({
  prefix: '/users',
})
  .use(betterAuth)
  .get('/', ({ query }) => getUsers(query), {
    auth: true,
    query: UserModel.listUsersQuery,
    response: {
      200: UserModel.getUsersResponse,
    },
  })
  .get('/beneficiaries', () => getBeneficiaries(), {
    auth: true,
    response: {
      200: UserModel.getBeneficiariesResponse,
    },
  })
  .get(
    '/:id',
    async ({ params }) => {
      const res = await getSingleUser(params.id)
      if (!res) throw status(404, 'User not found')
      return res
    },
    {
      auth: true,
      params: UserModel.getSingleUserQuery,
      response: {
        200: UserModel.getSingleUserResponse,
        404: t.Literal('User not found'),
      },
    },
  )
  .post(
    '',
    async ({ body }) => {
      const name = await getTeamName(body.teamId)
      if (!name) throw status(404, 'Team not found')
      const role = resolveRole(name)
      await auth.api.addMember({
        body: {
          userId: body.userId,
          teamId: body.teamId,
          organizationId: body.organizationId,
          role,
        },
      })
      await auth.api.addTeamMember({
        body: {
          userId: body.userId,
          teamId: body.teamId,
        },
      })
    },
    {
      auth: true,
      body: UserModel.createUser,
      response: {
        404: t.Literal('Team not found'),
      },
    },
  )
  .patch(
    ':id',
    async ({ params: { id }, body: { teamId }, session }) => {
      const name = await getTeamName(teamId)
      if (!name) throw status(404, 'Team not found')
      await auth.api.removeTeamMember({
        body: {
          userId: id,
          teamId,
        },
      })
      await auth.api.addTeamMember({
        body: {
          userId: id,
          teamId,
        },
      })
      const role = resolveRole(name)
      await auth.api.updateMemberRole({
        body: {
          memberId: id,
          role,
          organizationId: session.activeOrganizationId as string,
        },
      })
    },
    {
      auth: true,
      body: t.Object({
        teamId: t.String(),
      }),
      response: {
        404: t.Literal('Team not found'),
      },
    },
  )

type TeamRole =
  | 'member'
  | 'healthMember'
  | 'educationMember'
  | 'admin'
  | 'owner'

const mapTeamToRole: Readonly<Partial<Record<string, TeamRole>>> = {
  Salud: 'healthMember',
  Educación: 'educationMember',
  'Cáritas Lima': 'admin',
}

const resolveRole = (teamName: string): TeamRole =>
  mapTeamToRole[teamName] ?? 'member'

export default user
