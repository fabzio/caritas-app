import UserSettingsLayout from '@frontend/modules/settings/layout/user-settings'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings')({
  component: () => (
    <UserSettingsLayout>
      <Outlet />
    </UserSettingsLayout>
  ),
  validateSearch: () =>
    ({}) as {
      redirect?: string
    },
})
