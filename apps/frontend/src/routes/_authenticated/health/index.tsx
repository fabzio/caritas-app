import Dashboard from '@frontend/modules/health/pages/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/health/')({
  validateSearch: () =>
    ({}) as Partial<{
      activityId: string
      startDate: string
      endDate: string
      sex: 'M' | 'F'
      allied: string
      region: string
    }>,
  component: Dashboard,
})
