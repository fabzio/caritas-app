import { createFileRoute, Outlet } from '@tanstack/react-router'
import AuthLayout from '@/modules/auth/layout'

export const Route = createFileRoute('/auth')({
  component: () => (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  ),
})
