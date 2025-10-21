import EditActivityForm from '@frontend/modules/health/pages/activities/pages/edit-activity-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/health/activities/edit/$id',
)({
  component: EditActivityForm,
})
