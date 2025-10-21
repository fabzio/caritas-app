import CreateScholarship from '@frontend/modules/education/pages/scholarship/pages/create-scholarship'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/education/scholarship/create',
)({
  component: CreateScholarship,
})
