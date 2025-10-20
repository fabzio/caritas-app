import FormView from '@frontend/modules/health/pages/speciality/pages/create_speciality'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/health/speciality/form')({
  component: FormView,
})
