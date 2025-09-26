import { createFileRoute } from '@tanstack/react-router'
import Welcome from '@/modules/auth/pages/welcome'

export const Route = createFileRoute('/auth/welcome_/')({
  component: Welcome,
})
