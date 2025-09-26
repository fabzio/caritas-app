import { createFileRoute } from '@tanstack/react-router'
import Profile from '@/modules/settings/pages/profile'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: Profile,
})
