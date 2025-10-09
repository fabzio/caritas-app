import educationNavItems from '@frontend/modules/education/layout/nav-items'
import { DEFAULT_TEAMS } from '@frontend/shared/constants/default-teams'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import MainLayout from '@frontend/shared/layouts/main-layout'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/education')({
  beforeLoad: async ({ context: { authClient, queryClient } }) => {
    const teams = await queryClient.fetchQuery({
      queryKey: [QueryKeys.TEAMS],
      queryFn: async () => {
        const { data, error } = await authClient.organization.listUserTeams()
        if (error) throw error
        return data
      },
    })
    const educationTeam = teams.find(
      (team) => team.name === DEFAULT_TEAMS.EDUCATION,
    )
    if (!educationTeam)
      throw redirect({
        to: '/user',
      })
    await Promise.all([
      authClient.organization.setActive({
        organizationId: educationTeam.organizationId,
      }),
      authClient.organization.setActiveTeam({
        teamId: educationTeam.id,
      }),
    ])
  },
  component: () => (
    <MainLayout navItems={educationNavItems}>
      <Outlet />
    </MainLayout>
  ),
})
