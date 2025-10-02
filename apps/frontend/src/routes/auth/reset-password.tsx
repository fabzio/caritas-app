import ResetPassword from '@frontend/modules/auth/pages/reset-password.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: () =>
    ({}) as {
      email: string
      otp: string
    },
  component: ResetPassword,
})
