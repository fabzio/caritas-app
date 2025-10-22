import CreateActivityForm from '@frontend/modules/health/pages/activities/pages/create-activity-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/health/activities/form')({
  component: CreateActivityForm,
})
