import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/modules/admin/pages/dashboard'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: Dashboard,
})
