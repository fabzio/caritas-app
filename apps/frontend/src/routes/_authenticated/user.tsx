import userNavItems from '@frontend/modules/user/layout/nav-items'
import MainLayout from '@frontend/shared/layouts/main-layout'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/user')({
  component: () => (
    <MainLayout navItems={userNavItems}>
      <Outlet />
    </MainLayout>
  ),
})
