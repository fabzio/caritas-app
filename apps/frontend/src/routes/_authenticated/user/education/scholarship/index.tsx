import ScholarshipPage from '@frontend/modules/user/pages/education/scholarship'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/user/education/scholarship/',
)({
  component: ScholarshipPage,
})

function _RouteComponent() {
  return <div>Hello "/_authenticated/user/scholarship/"!</div>
}
