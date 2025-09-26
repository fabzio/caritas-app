import { createFileRoute } from '@tanstack/react-router'
import ForgotPassword from '@/modules/auth/pages/forgot-password'

export const Route = createFileRoute('/auth/forgot-password')({
  validateSearch: () =>
    ({}) as {
      email?: string
    },
  component: ForgotPassword,
})
