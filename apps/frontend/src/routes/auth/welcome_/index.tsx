import Welcome from '@frontend/modules/auth/pages/welcome'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/welcome_/')({
  component: Welcome,
})
