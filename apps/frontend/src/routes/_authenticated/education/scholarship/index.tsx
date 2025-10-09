import ScholarshipPage from '@frontend/modules/education/pages/scholarship'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/education/scholarship/')({
  component: ScholarshipPage,
})
