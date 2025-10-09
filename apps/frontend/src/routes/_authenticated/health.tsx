import healthNavItems from '@frontend/modules/health/layout/nav-items'
import { DEFAULT_TEAMS } from '@frontend/shared/constants/default-teams'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import MainLayout from '@frontend/shared/layouts/main-layout'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/health')({
  beforeLoad: async ({ context: { authClient, queryClient } }) => {
    const teams = await queryClient.fetchQuery({
      queryKey: [QueryKeys.USER_TEAMS],
      queryFn: async () => {
        const { data, error } = await authClient.organization.listUserTeams()
        if (error) throw error
        return data
      },
    })

    const healthTeam = teams.find((team) => team.name === DEFAULT_TEAMS.HEALTH)
    if (!healthTeam)
      throw redirect({
        to: '/user',
      })
    await Promise.all([
      authClient.organization.setActive({
        organizationId: healthTeam.organizationId,
      }),
      authClient.organization.setActiveTeam({
        teamId: healthTeam.id,
      }),
    ])
    const { data } = await authClient.organization.getActiveMemberRole()
    const haveHealthRole = data?.role.split(',').includes('healthMember')
    if (!haveHealthRole)
      throw redirect({
        to: '/',
      })
  },
  component: () => (
    <MainLayout navItems={healthNavItems}>
      <Outlet />
    </MainLayout>
  ),
})
