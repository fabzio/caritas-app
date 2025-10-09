import { auth } from '@api/lib/auth'
import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'
import { UserModel } from './model'
import {
  getMemberId,
  getSingleUser,
  getTeamsByIds,
  getUserRoles,
  getUsers,
  getUserTeamIds,
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
      const teamIds = Array.from(new Set(body.teamIds))
      const teams = await getTeamsByIds(teamIds)
      if (teams.length !== teamIds.length) throw status(404, 'Team not found')
      const roles = new Set(teams.map((team) => resolveRole(team.name)))
      const existingRoles = await getUserRoles(body.userId, body.organizationId)
      const rolesToAdd = Array.from(roles).filter(
        (role) => !existingRoles.includes(role),
      )
      for (const role of rolesToAdd)
        await auth.api.addMember({
          body: {
            userId: body.userId,
            organizationId: body.organizationId,
            role,
          },
        })
      const existingTeamIds = await getUserTeamIds(body.userId)
      const teamsToRemove = existingTeamIds.filter(
        (teamId) => !teamIds.includes(teamId),
      )
      for (const teamId of teamsToRemove)
        await auth.api.removeTeamMember({
          body: {
            userId: body.userId,
            teamId,
          },
        })
      const teamsToAdd = teamIds.filter(
        (teamId) => !existingTeamIds.includes(teamId),
      )
      for (const teamId of teamsToAdd)
        await auth.api.addTeamMember({
          body: {
            userId: body.userId,
            teamId,
          },
        })
      return { success: true }
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
    async ({ params: { id }, body: { teamIds }, session, request }) => {
      const organizationId = session.activeOrganizationId
      if (!organizationId) throw status(400, 'Organization not found')
      const uniqueTeamIds = Array.from(new Set(teamIds))
      const teams = await getTeamsByIds(uniqueTeamIds)
      if (teams.length !== uniqueTeamIds.length)
        throw status(404, 'Team not found')
      const existingTeamIds = await getUserTeamIds(id)
      const teamsToRemove = existingTeamIds.filter(
        (teamId) => !uniqueTeamIds.includes(teamId),
      )
      const teamsToAdd = uniqueTeamIds.filter(
        (teamId) => !existingTeamIds.includes(teamId),
      )
      for (const teamId of teamsToRemove)
        await auth.api.removeTeamMember({
          body: {
            userId: id,
            teamId,
          },
          headers: request.headers,
        })
      for (const teamId of teamsToAdd)
        await auth.api.addTeamMember({
          body: {
            userId: id,
            teamId,
          },
          headers: request.headers,
        })
      const { role: currRole } = await auth.api.getActiveMemberRole({
        headers: request.headers,
      })
      const roles = new Set(teams.map((team) => resolveRole(team.name)))
      if (currRole.split(',').includes('owner')) roles.add('owner')
      const memberId = await getMemberId(id, organizationId)
      if (!memberId) throw status(404, 'Member not found')
      await auth.api.updateMemberRole({
        body: {
          role: Array.from(roles),
          memberId,
          organizationId,
        },
        headers: request.headers,
      })
    },
    {
      auth: true,
      body: t.Object({
        teamIds: t.Array(t.String(), { minItems: 1 }),
      }),
      response: {
        200: t.Void(),
        400: t.Literal('Organization not found'),
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
  Administrador: 'admin',
}

const resolveRole = (teamName: string): TeamRole =>
  mapTeamToRole[teamName] ?? 'member'

export default user
