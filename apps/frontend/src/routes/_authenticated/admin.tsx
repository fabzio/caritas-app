import adminNavItems from '@frontend/modules/admin/layout/nav-items'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import MainLayout from '@frontend/shared/layouts/main-layout'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context: { authClient, queryClient }, location }) => {
    const data = await queryClient.fetchQuery({
      queryKey: [QueryKeys.ADMIN.ORGS_ROLE],
      queryFn: async () => {
        const { data, error } =
          await authClient.organization.getActiveMemberRole()
        if (error) return null
        return data
      },
    })
    if (!data) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }
    const isAdmin = ['admin', 'owner'].includes(data.role)
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
})
