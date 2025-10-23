import ScholarshipPage from '@frontend/modules/user/pages/education/scholarship'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/user/education/scholarship/',
)({
  component: ScholarshipPage,
})
