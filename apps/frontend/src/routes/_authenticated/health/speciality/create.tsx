import CreateSpeciality from '@frontend/modules/health/pages/speciality/create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/health/speciality/create',
)({
  component: CreateSpeciality,
})
