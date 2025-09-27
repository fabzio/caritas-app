import { createFileRoute, Outlet } from '@tanstack/react-router'
import SettingsLayout from '@/shared/layouts/settings-layout'

export const Route = createFileRoute('/_authenticated/user/settings')({
  component: () => (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  ),
})
