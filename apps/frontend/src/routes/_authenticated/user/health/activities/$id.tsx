import UserActivityDetail from '@frontend/modules/user/pages/health/pages/activities/page/detail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/user/health/activities/$id',
)({
  component: UserActivityDetail,
})
