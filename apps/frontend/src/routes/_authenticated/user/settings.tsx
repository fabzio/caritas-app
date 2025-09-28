import { createFileRoute, Outlet } from '@tanstack/react-router'
import UserSettingsLayout from '@/modules/settings/layout/user-settings'

export const Route = createFileRoute('/_authenticated/user/settings')({
  component: () => (
    <UserSettingsLayout>
      <Outlet />
    </UserSettingsLayout>
  ),
})
