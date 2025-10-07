import ForgotPassword from '@frontend/modules/auth/pages/forgot-password'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/forgot-password')({
  validateSearch: () =>
    ({}) as {
      email?: string
    },
  component: ForgotPassword,
})
