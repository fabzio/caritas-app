import ScholarshipPage from '@frontend/modules/organization/pages/education/scholarship/index'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'
export type ScholarshipFilters = Filters & {
  name?: string
  active?: boolean
}
export const Route = createFileRoute(
  '/_authenticated/organization/education/scholarship/',
)({
  validateSearch: () => ({}) as ScholarshipFilters,
  component: ScholarshipPage,
})
function RouteComponent() {
  return <div>Hello "/_authenticated/organization/"!zxds</div>
}
