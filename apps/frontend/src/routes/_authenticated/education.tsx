import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/education')({
  beforeLoad: async ({ context: { authClient, queryClient } }) => {
    const teams = await queryClient.fetchQuery({
      queryKey: [QueryKeys.TEAMS],
      queryFn: async () => {
        const { data, error } = await authClient.organization.listTeams()
        if (error) throw error
        return data
      },
    })
    const haveEducationTeam = teams.filter((org) => org.name === 'Educación')
    if (!haveEducationTeam?.length)
      throw redirect({
        to: '/user',
      })
    await Promise.all([
      authClient.organization.setActive({
        organizationId: haveEducationTeam?.[0]?.organizationId,
      }),
      authClient.organization.setActiveTeam({
        teamId: haveEducationTeam?.[0]?.id,
      }),
    ])
  },
})
