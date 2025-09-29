import { createFileRoute } from '@tanstack/react-router'
import ScholarshipPage from '@/modules/education/pages/scholarship'

export const Route = createFileRoute('/_authenticated/education/scholarship')({
  component: ScholarshipPage,
})
