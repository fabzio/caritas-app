import UserSettingsLayout from '@frontend/modules/settings/layout/user-settings'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/user/settings')({
  component: () => (
    <UserSettingsLayout>
      <Outlet />
    </UserSettingsLayout>
  ),
})
