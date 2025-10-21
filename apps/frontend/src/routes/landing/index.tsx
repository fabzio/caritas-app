import LandingPage from '@frontend/modules/education/pages/landing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/landing/')({
  component: LandingPage,
})
