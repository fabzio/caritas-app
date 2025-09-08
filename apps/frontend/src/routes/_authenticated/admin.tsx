import { createFileRoute, Outlet } from '@tanstack/react-router'
import adminNavItems from '@/modules/admin/layout/nav-items'
import AppSidebar from '@/shared/components/app-sidebar'
import NavMain from '@/shared/components/nav-main'
import MainLayout from '@/shared/layouts/main-layout'

export const Route = createFileRoute('/_authenticated/admin')({
  component: () => (
    <MainLayout
      sidebar={
        <AppSidebar>
          <NavMain items={adminNavItems} />
        </AppSidebar>
      }
    >
      <Outlet />
    </MainLayout>
  ),
})
