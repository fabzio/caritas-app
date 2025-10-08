import SpecialityPage from '@frontend/modules/health/pages/speciality'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/health/speciality')({
  component: SpecialityPage,
})
