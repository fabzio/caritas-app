import EducationDashboard from '@frontend/modules/education/pages/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/education/')({
  component: EducationDashboard,
})
