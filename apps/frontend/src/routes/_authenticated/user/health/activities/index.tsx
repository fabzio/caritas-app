import UserActivities from '@frontend/modules/user/pages/health/pages/activities'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/user/health/activities/')(
  {
    validateSearch: () =>
      ({}) as Partial<{
        view: 'active' | 'participated' | 'notParticipated' | 'canceled'
      }>,
    component: UserActivities,
  },
)
