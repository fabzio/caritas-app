import ActivityDetailPage from '@frontend/modules/health/pages/activities/pages/detail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/health/activities/$activityId/',
)({
  component: ActivityDetailPage,
})
