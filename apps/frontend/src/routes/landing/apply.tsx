import ApplyPage from '@frontend/modules/education/pages/landing/pages/apply'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/landing/apply')({
  component: ApplyPage,
})
