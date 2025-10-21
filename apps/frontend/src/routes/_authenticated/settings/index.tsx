import Profile from '@frontend/modules/settings/pages/profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: Profile,
})
