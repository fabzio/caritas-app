import { env } from '@frontend/env'
import adminNavItems from '@frontend/modules/admin/layout/nav-items'
import { DEFAULT_TEAMS } from '@frontend/shared/constants/default-teams'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import MainLayout from '@frontend/shared/layouts/main-layout'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context: { authClient, queryClient }, location }) => {
    const teams = await queryClient.fetchQuery({
      queryKey: [QueryKeys.USER_TEAMS],
      queryFn: async () => {
        const { data, error } = await authClient.organization.listUserTeams()
        if (error) throw error
        return data
      },
    })

    const adminTeam = teams.find((team) => team.name === DEFAULT_TEAMS.ADMIN)
    if (!adminTeam)
      throw redirect({
        to: '/user',
      })

    await Promise.all([
      authClient.organization.setActive({
        organizationId: adminTeam.organizationId,
      }),
      authClient.organization.setActiveTeam({
        teamId: adminTeam.id,
      }),
    ])

    const { data } = await authClient.organization.getActiveMemberRole()

    if (!data) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    const isAdmin = data.role
      .split(',')
      .map((role) => role.trim().toLowerCase())
      .some((role) => role === 'admin' || role === 'owner')

    if (!isAdmin) {
      throw redirect({
        to: '/user',
      })
    }
  },
  component: () => (
    <MainLayout navItems={adminNavItems}>
      <Outlet />
    </MainLayout>
  ),
  head: () => ({
    meta: [
      {
        title: `${env.VITE_APP_TITLE} | Administrador`,
      },
    ],
  }),
})
