import { createFileRoute } from '@tanstack/react-router'
import ResetPassword from '@/modules/auth/pages/reset-password.tsx'

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: () =>
    ({}) as {
      email: string
      otp: string
    },
  component: ResetPassword,
})
