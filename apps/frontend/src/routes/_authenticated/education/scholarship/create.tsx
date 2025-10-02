import { createFileRoute } from '@tanstack/react-router'
import CreateScholarship from '@/modules/education/pages/scholarship/create'

export const Route = createFileRoute(
  '/_authenticated/education/scholarship/create',
)({
  component: CreateScholarship,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/education/scholarship/create"!</div>
}
