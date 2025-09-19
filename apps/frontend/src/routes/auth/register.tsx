import { createFileRoute } from '@tanstack/react-router'
import Register from '@/modules/auth/pages/register'

export const Route = createFileRoute('/auth/register')({
  component: Register,
})
