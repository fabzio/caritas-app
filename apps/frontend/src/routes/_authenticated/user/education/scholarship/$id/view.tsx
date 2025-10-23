import ViewScholarshipPage from '@frontend/modules/user/pages/education/scholarship/pages/view-scholarship'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/user/education/scholarship/$id/view',
)({
  component: ViewScholarshipPage,
})
