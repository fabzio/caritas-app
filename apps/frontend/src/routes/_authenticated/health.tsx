import healthNavItems from '@frontend/modules/health/layout/nav-items'
import { DEFAULT_TEAMS } from '@frontend/shared/constants/default-teams'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import MainLayout from '@frontend/shared/layouts/main-layout'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

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
    const haveHealthTeam = teams.filter(
      (org) => org.name === DEFAULT_TEAMS.HEALTH,
    )
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
  component: () => (
    <MainLayout navItems={healthNavItems}>
      <Outlet />
    </MainLayout>
  ),
})
