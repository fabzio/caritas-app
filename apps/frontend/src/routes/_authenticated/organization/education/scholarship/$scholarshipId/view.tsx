import ViewScholarship from '@frontend/modules/organization/pages/education/scholarship/pages/view-scholarship'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/education/scholarship/$scholarshipId/view',
)({
  component: ViewScholarship,
})
