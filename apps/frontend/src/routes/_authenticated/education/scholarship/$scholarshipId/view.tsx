import { createFileRoute } from '@tanstack/react-router'
import ViewScholarship from '@/modules/education/pages/scholarship/view'

export const Route = createFileRoute(
  '/_authenticated/education/scholarship/$scholarshipId/view',
)({
  component: ViewScholarship,
})
