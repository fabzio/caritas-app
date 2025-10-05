import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/health')({
  beforeLoad: async ({ context: { authClient, queryClient } }) => {
    const teams = await queryClient.fetchQuery({
      queryKey: [QueryKeys.TEAMS],
      queryFn: async () => {
        const { data, error } = await authClient.organization.listTeams()
        if (error) throw error
        return data
      },
    })
    const haveHealthTeam = teams.filter((org) => org.name === 'Salud')
    if (!haveHealthTeam?.length)
      throw redirect({
        to: '/user',
      })
    await Promise.all([
      authClient.organization.setActive({
        organizationId: haveHealthTeam?.[0]?.organizationId,
      }),
      authClient.organization.setActiveTeam({
        teamId: haveHealthTeam?.[0]?.id,
      }),
    ])
  },
})
