import ViewScholarship from '@frontend/modules/education/pages/scholarship/pages/view-scholarship'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
  '/_authenticated/education/scholarship/$scholarshipId/view',
)({
  component: ViewScholarship,
})
