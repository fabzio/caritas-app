import Register from '@frontend/modules/auth/pages/register'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/register')({
  validateSearch: () =>
    ({}) as Partial<{
      name: string
      email: string
    }>,
  component: Register,
})
